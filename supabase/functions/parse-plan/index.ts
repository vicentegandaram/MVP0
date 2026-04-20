import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath } = await req.json()

    if (!filePath) {
      return new Response(JSON.stringify({ error: 'filePath requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar que es PDF (Claude solo soporta PDF para documentos)
    const isNotPdf = !filePath.toLowerCase().endsWith('.pdf')

    // Service role para acceder al storage sin restricciones
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Descargar archivo desde storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('patient-files')
      .download(filePath)

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Archivo no encontrado: ' + downloadError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurado en los secrets de Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Convertir a base64
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.slice(i, i + chunkSize))
    }
    const base64Data = btoa(binary)

    // Construir el mensaje para Claude
    // Para PDFs usamos document type, para otros archivos enviamos el texto del contenido
    let messageContent: any[]

    if (!isNotPdf) {
      messageContent = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: `Eres un asistente nutricional experto. Analiza esta pauta alimentaria/plan nutricional y extrae TODOS los alimentos e ingredientes mencionados.

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
- Si un alimento aparece varias veces, suma las cantidades
- Si no hay cantidad exacta, estima la cantidad semanal razonable
- Solo devuelve el JSON, absolutamente nada más`,
        },
      ]
    } else {
      // Para Word u otros formatos, intentamos leer como texto
      const textDecoder = new TextDecoder('utf-8', { fatal: false })
      const rawText = textDecoder.decode(uint8)
      // Limpiar caracteres no imprimibles manteniendo texto legible
      const cleanText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')

      messageContent = [
        {
          type: 'text',
          text: `Eres un asistente nutricional experto. Analiza este plan nutricional y extrae todos los alimentos.

Contenido del documento:
${cleanText.slice(0, 8000)}

Responde ÚNICAMENTE con JSON válido:
{
  "foods": [
    { "food_name": "Avena", "quantity": 50, "unit": "g", "category": "grains" }
  ]
}

Categorías: protein, vegetables, fruits, dairy, grains, fats, other
Unidades: g, ml, piece, cup, tbsp
Suma cantidades del mismo alimento en toda la semana. Solo devuelve el JSON.`,
        },
      ]
    }

    // Llamar a Claude API
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: messageContent }],
      }),
    })

    if (!claudeRes.ok) {
      const errText = await claudeRes.text()
      return new Response(
        JSON.stringify({ error: 'Error al llamar a Claude API: ' + errText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const claudeData = await claudeRes.json()
    const responseText = claudeData.content?.[0]?.text || ''

    // Parsear JSON de la respuesta
    let foods: any[] = []
    try {
      foods = JSON.parse(responseText).foods || []
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          foods = JSON.parse(match[0]).foods || []
        } catch {
          foods = []
        }
      }
    }

    // Normalizar y validar
    const validUnits = ['g', 'ml', 'piece', 'cup', 'tbsp']
    const validCategories = ['protein', 'vegetables', 'fruits', 'dairy', 'grains', 'fats', 'other']

    const normalized = foods.map((f: any) => ({
      food_name: String(f.food_name || '').trim(),
      quantity: Math.max(1, Number(f.quantity) || 100),
      unit: validUnits.includes(f.unit) ? f.unit : 'g',
      category: validCategories.includes(f.category) ? f.category : 'other',
    })).filter(f => f.food_name.length > 0)

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
