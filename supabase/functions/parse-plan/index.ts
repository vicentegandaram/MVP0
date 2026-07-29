import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROMPT_PDF = `Eres un asistente nutricional experto. Analiza esta pauta alimentaria/plan nutricional y extrae TODOS los alimentos e ingredientes mencionados.

Responde ÚNICAMENTE con JSON válido, sin texto adicional antes o después:
{
  "foods": [
    { "food_name": "Avena", "quantity": 50, "unit": "g", "category": "grains" },
    { "food_name": "Leche descremada", "quantity": 200, "unit": "ml", "category": "dairy" }
  ]
}

Categorías válidas: protein, vegetables, fruits, dairy, grains, fats, other
Unidades válidas: g, ml, piece, cup, tbsp

Reglas importantes:
- Incluye TODOS los alimentos de todos los días y tiempos de comida
- Suma las cantidades del mismo alimento a lo largo de la semana
- Si no hay cantidad exacta, estima la cantidad semanal razonable
- Solo devuelve el JSON, absolutamente nada más`

const PROMPT_TEXT = (text: string) => `Eres un asistente nutricional experto. Analiza este plan nutricional y extrae todos los alimentos.

Contenido del documento:
${text}

Responde ÚNICAMENTE con JSON válido:
{
  "foods": [
    { "food_name": "Avena", "quantity": 50, "unit": "g", "category": "grains" }
  ]
}

Categorías: protein, vegetables, fruits, dairy, grains, fats, other
Unidades: g, ml, piece, cup, tbsp
Suma cantidades del mismo alimento en toda la semana. Solo devuelve el JSON.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth: el nutricionista debe estar logueado y ser dueño del documento.
    // Sin esto cualquiera con la anon key podía gatillar llamadas a Gemini
    // y vaciarte la cuota gratis.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Falta header Authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { filePath } = await req.json()
    if (!filePath || typeof filePath !== 'string') {
      return new Response(JSON.stringify({ error: 'filePath requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isPdf = filePath.toLowerCase().endsWith('.pdf')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!

    // Cliente con el JWT del usuario: las consultas pasan por RLS,
    // así que sólo encontrará el documento si le pertenece.
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: doc } = await userClient
      .from('patient_document')
      .select('id')
      .eq('file_path', filePath)
      .maybeSingle()

    if (!doc) {
      return new Response(JSON.stringify({ error: 'Documento no encontrado o sin permiso' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Service role sólo después de validar permisos: para descargar del bucket privado.
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('patient-files')
      .download(filePath)

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Archivo no encontrado: ' + downloadError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY no configurado en los secrets de Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Convertir a base64 (PDF) o a texto (Word/otros)
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)

    let parts: any[]
    if (isPdf) {
      let binary = ''
      const chunkSize = 8192
      for (let i = 0; i < uint8.length; i += chunkSize) {
        binary += String.fromCharCode(...uint8.slice(i, i + chunkSize))
      }
      const base64Data = btoa(binary)
      parts = [
        { inline_data: { mime_type: 'application/pdf', data: base64Data } },
        { text: PROMPT_PDF },
      ]
    } else {
      const decoder = new TextDecoder('utf-8', { fatal: false })
      const cleanText = decoder
        .decode(uint8)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
        .slice(0, 8000)
      parts = [{ text: PROMPT_TEXT(cleanText) }]
    }

    // Gemini 1.5 Flash · free tier (1500 reqs/día). response_mime_type fuerza JSON válido.
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            response_mime_type: 'application/json',
          },
        }),
      },
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return new Response(
        JSON.stringify({ error: 'Error de Gemini API: ' + errText.slice(0, 300) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const geminiData = await geminiRes.json()
    const responseText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parsear JSON de la respuesta (con fallback por si responde con prosa)
    let foods: any[] = []
    try {
      foods = JSON.parse(responseText).foods || []
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) {
        try { foods = JSON.parse(match[0]).foods || [] } catch { foods = [] }
      }
    }

    // Normalizar y validar
    const validUnits = ['g', 'ml', 'piece', 'cup', 'tbsp']
    const validCategories = ['protein', 'vegetables', 'fruits', 'dairy', 'grains', 'fats', 'other']

    const normalized = foods
      .map((f: any) => ({
        food_name: String(f.food_name || '').trim(),
        quantity: Math.max(1, Number(f.quantity) || 100),
        unit: validUnits.includes(f.unit) ? f.unit : 'g',
        category: validCategories.includes(f.category) ? f.category : 'other',
      }))
      .filter(f => f.food_name.length > 0)

    return new Response(JSON.stringify({ foods: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
