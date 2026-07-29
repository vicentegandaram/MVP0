import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePatient, useNutritionPlans, useActiveNutritionPlan,
  usePatientDocuments, useUploadDocument, useDeleteDocument, getDocumentSignedUrl
} from '../hooks/useApi'
import {
  ChevronLeft, Plus, Flame, Utensils, Target, X, ShoppingCart, Sparkles,
  Loader2, Wand2, UtensilsCrossed, FileText, Upload, Download, Trash2,
  AlertCircle, Brain, CheckCircle2, Pencil, Share2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTemplatesForObjective, MealObjective } from '../data/mealTemplates'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { getErrorMessage } from '../lib/errors'
import type { FoodUnit, ShoppingCategory } from '../types'

interface ExtractedFood {
  food_name: string
  quantity: number
  unit: FoodUnit
  category: ShoppingCategory
}

export function PlanDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ── Plan generation modal state ──────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState<MealObjective>('maintain')
  const [customName, setCustomName] = useState('')
  const [customStartDate, setCustomStartDate] = useState('')
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Document upload state ────────────────────────────────────
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docNotes, setDocNotes] = useState('')
  const [docError, setDocError] = useState<string | null>(null)

  // ── AI extraction state ──────────────────────────────────────
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null)
  const [extractedFoods, setExtractedFoods] = useState<ExtractedFood[]>([])
  const [showFoodsModal, setShowFoodsModal] = useState(false)
  const [creatingFromPdf, setCreatingFromPdf] = useState(false)
  const [editingFood, setEditingFood] = useState<number | null>(null)

  const { data: patient } = usePatient(patientId || '')
  const { data: plans = [] } = useNutritionPlans(patientId || '')
  const { data: activePlan } = useActiveNutritionPlan(patientId || '')
  const { data: planDocs = [] } = usePatientDocuments(patientId || '')
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const planDocuments = planDocs.filter(d => d.notes?.startsWith('[PLAN]'))

  const openModal = () => {
    setError(null)
    setCustomName('')
    setCustomStartDate('')
    setSelectedObjective('maintain')
    setShowModal(true)
  }

  // ── Upload document ──────────────────────────────────────────
  const handlePlanDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !patientId) return
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setDocError(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 10 MB`)
      e.target.value = ''
      return
    }
    setUploadingDoc(true)
    setDocError(null)
    try {
      await uploadDocument.mutateAsync({
        patientId,
        file,
        notes: `[PLAN] ${docNotes || activePlan?.name || 'Pauta nutricional'}`
      })
      setDocNotes('')
      e.target.value = ''
    } catch (err) {
      setDocError(getErrorMessage(err, 'Error al subir el archivo'))
    } finally {
      setUploadingDoc(false)
    }
  }

  // ── Download document ────────────────────────────────────────
  const handleDownload = async (filePath: string, fileName: string) => {
    const url = await getDocumentSignedUrl(filePath)
    if (!url) {
      toast.error('No se pudo obtener el enlace')
      return
    }
    const a = document.createElement('a')
    a.href = url; a.download = fileName; a.target = '_blank'; a.click()
  }

  // ── AI: analyze document → extract foods (Edge Function: parse-plan) ──
  const handleAnalyzeDoc = async (filePath: string, docId: string) => {
    setAnalyzingDocId(docId)
    setDocError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('parse-plan', {
        body: { filePath },
      })

      if (fnError) throw new Error(fnError.message || 'Error al invocar la función')
      if (data?.error) throw new Error(data.error)

      const foods = (data?.foods ?? []) as ExtractedFood[]
      if (foods.length === 0) {
        throw new Error('No se encontraron alimentos. Verifica que el archivo sea una pauta nutricional en PDF.')
      }

      setExtractedFoods(foods)
      setShowFoodsModal(true)
    } catch (err) {
      setDocError(getErrorMessage(err, 'Error al analizar el documento'))
    } finally {
      setAnalyzingDocId(null)
    }
  }

  // ── AI: create shopping list from extracted foods ─────────────
  const handleCreateListFromFoods = async () => {
    if (!patientId || extractedFoods.length === 0) return
    setCreatingFromPdf(true)
    setDocError(null)
    try {
      // Delete existing shopping list
      const { data: existingList } = await supabase
        .from('shopping_list')
        .select('id')
        .eq('patient_id', patientId)
        .maybeSingle()

      if (existingList) {
        await supabase.from('shopping_item').delete().eq('shopping_list_id', existingList.id)
        await supabase.from('shopping_list').delete().eq('id', existingList.id)
      }

      // Create new shopping list
      const { data: list, error: listError } = await supabase
        .from('shopping_list')
        .insert({
          patient_id: patientId,
          week_start_date: new Date().toISOString().split('T')[0],
          name: 'Lista generada desde pauta PDF',
          status: 'draft',
        })
        .select()
        .single()

      if (listError) throw listError

      // Insert items
      const items = extractedFoods.map(food => ({
        shopping_list_id: list.id,
        food_name: food.food_name,
        quantity: food.quantity,
        unit: food.unit,
        category: food.category,
        is_purchased: false,
      }))

      const { error: itemsError } = await supabase.from('shopping_item').insert(items)
      if (itemsError) throw itemsError

      setShowFoodsModal(false)
      navigate(`/plans/${patientId}/shopping`)
    } catch (err) {
      setDocError(getErrorMessage(err, 'Error al generar la lista'))
    } finally {
      setCreatingFromPdf(false)
    }
  }

  // ── Auto-generate plan ───────────────────────────────────────
  const generatePlanWithMeals = async () => {
    setGeneratingPlan(true)
    setError(null)

    try {
      if (activePlan) {
        await supabase.from('nutrition_plan').update({ is_active: false }).eq('id', activePlan.id)
      }

      const objectiveConfig: Record<MealObjective, { calories: number; protein: number; carbs: number; fat: number }> = {
        lose_weight:  { calories: 1800, protein: 140, carbs: 150, fat: 55 },
        muscle_gain:  { calories: 2600, protein: 170, carbs: 300, fat: 65 },
        maintain:     { calories: 2200, protein: 150, carbs: 250, fat: 65 },
        medical:      { calories: 2000, protein: 120, carbs: 280, fat: 60 },
      }

      const objectiveLabels: Record<MealObjective, string> = {
        lose_weight:  'Pérdida de peso',
        muscle_gain:  'Ganancia de músculo',
        maintain:     'Mantenimiento',
        medical:      'Seguimiento médico',
      }

      const config = objectiveConfig[selectedObjective]

      const { data: plan, error: planError } = await supabase
        .from('nutrition_plan')
        .insert({
          patient_id: patientId,
          name: customName.trim() || `Plan de ${objectiveLabels[selectedObjective]}`,
          start_date: customStartDate || new Date().toISOString().split('T')[0],
          daily_calories: config.calories,
          daily_protein:  config.protein,
          daily_carbs:    config.carbs,
          daily_fat:      config.fat,
          is_active: true,
          observations: `Plan generado automáticamente · Objetivo: ${objectiveLabels[selectedObjective]}`,
        })
        .select()
        .single()

      if (planError) throw planError

      const templates  = getTemplatesForObjective(selectedObjective)
      const mealTypes  = ['breakfast', 'mid_morning', 'lunch', 'afternoon', 'dinner'] as const

      const allMeals = [1, 2, 3, 4, 5, 6, 7].flatMap(day =>
        mealTypes.map(mealType => {
          const opts = templates.filter(t => t.meal_type === mealType)
          const t = opts[(day % 2 === 0 && opts.length > 1) ? 1 : 0]
          return {
            plan_id:     plan.id,
            day_of_week: day,
            meal_type:   mealType,
            name:        t?.name     ?? mealType,
            calories:    t?.calories ?? 0,
            protein:     t?.protein  ?? 0,
            carbs:       t?.carbs    ?? 0,
            fat:         t?.fat      ?? 0,
          }
        })
      )

      const { data: createdMeals, error: mealsError } = await supabase
        .from('meal').insert(allMeals).select()
      if (mealsError) throw mealsError

      const allFoods = createdMeals.flatMap(meal => {
        const opts = templates.filter(t => t.meal_type === meal.meal_type)
        const usedIdx = (meal.day_of_week % 2 === 0 && opts.length > 1) ? 1 : 0
        const t = opts[usedIdx]
        return (t?.foods ?? []).map(food => ({
          meal_id:   meal.id,
          food_name: food.name,
          quantity:  food.quantity,
          unit:      food.unit,
          category:  food.category,
        }))
      })

      if (allFoods.length > 0) {
        const { error: foodsError } = await supabase.from('meal_food').insert(allFoods)
        if (foodsError) throw foodsError
      }

      await queryClient.invalidateQueries({ queryKey: ['nutritionPlans', patientId] })
      await queryClient.invalidateQueries({ queryKey: ['nutritionPlan', 'active', patientId] })
      await queryClient.refetchQueries({ queryKey: ['nutritionPlan', 'active', patientId] })

      setShowModal(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al generar el plan'))
    } finally {
      setGeneratingPlan(false)
    }
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const categoryLabels: Record<string, string> = {
    protein: 'Proteínas', vegetables: 'Verduras', fruits: 'Frutas',
    dairy: 'Lácteos', grains: 'Cereales', fats: 'Grasas', other: 'Otros'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/plans" className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.name} {patient.last_name}
          </h1>
          <p className="text-gray-500">Plan nutricional</p>
        </div>
      </div>

      {/* ── SUBIR PAUTA NUTRICIONAL (PROMINENTE) ── */}
      <div className="bg-white rounded-xl border-2 border-dashed border-violet-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
              <FileText className="h-5 w-5 text-violet-500" />
              Subir pauta nutricional
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Sube un PDF con la pauta y la IA extraerá los alimentos para generar la lista de compras
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <label className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
              uploadingDoc ? 'bg-gray-100 text-gray-500' : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}>
              {uploadingDoc
                ? <><Loader2 className="h-4 w-4 animate-spin" />Subiendo...</>
                : <><Upload className="h-4 w-4" />Seleccionar archivo</>}
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
                onChange={handlePlanDocUpload}
                disabled={uploadingDoc}
              />
            </label>
            <input
              type="text"
              value={docNotes}
              onChange={e => setDocNotes(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-violet-400 focus:outline-none"
            />
            {docError && <p className="text-xs text-red-600">{docError}</p>}
          </div>
        </div>
        {planDocuments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-400 mb-2">{planDocuments.length} pauta{planDocuments.length !== 1 ? 's' : ''} subida{planDocuments.length !== 1 ? 's' : ''}</p>
            {planDocuments.map(doc => {
              const isPdf = doc.file_name.toLowerCase().endsWith('.pdf')
              const isAnalyzing = analyzingDocId === doc.id
              return (
                <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-violet-600">
                      {doc.file_name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{doc.file_name}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {isPdf && (
                      <button
                        onClick={() => handleAnalyzeDoc(doc.file_path, doc.id)}
                        disabled={isAnalyzing || !!analyzingDocId}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 disabled:opacity-50"
                      >
                        {isAnalyzing
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analizando...</>
                          : <><Brain className="h-3.5 w-3.5" />Analizar con IA</>}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc.file_path, doc.file_name)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument.mutate({ id: doc.id, filePath: doc.file_path, patientId: patientId! })}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Plan Card */}
      {activePlan ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Plan Activo
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{activePlan.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Desde {format(new Date(activePlan.start_date), 'dd MMM yyyy', { locale: es })}
                {activePlan.end_date && ` hasta ${format(new Date(activePlan.end_date), 'dd MMM yyyy', { locale: es })}`}
              </p>
            </div>
            <button onClick={openModal} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Crear nuevo plan
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: <Flame className="h-4 w-4" />, label: 'Calorías', value: activePlan.daily_calories, unit: 'kcal/día' },
              { icon: <Utensils className="h-4 w-4" />, label: 'Proteína', value: `${activePlan.daily_protein}g`, unit: '/día' },
              { icon: <Utensils className="h-4 w-4" />, label: 'Carbs', value: `${activePlan.daily_carbs}g`, unit: '/día' },
              { icon: <Utensils className="h-4 w-4" />, label: 'Grasas', value: `${activePlan.daily_fat}g`, unit: '/día' },
            ].map(({ icon, label, value, unit }) => (
              <div key={label} className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">{icon}<span className="text-sm">{label}</span></div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{unit}</p>
              </div>
            ))}
          </div>

          {activePlan.observations && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">{activePlan.observations}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-emerald-200 flex gap-3">
            <Link
              to={`/plans/${patientId}/view`}
              className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Ver plan completo
            </Link>
            <Link
              to={`/plans/${patientId}/shopping`}
              className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Lista de compras
            </Link>
            <button
              onClick={async () => {
                const { data, error } = await supabase
                  .from('patient')
                  .select('portal_token')
                  .eq('id', patientId!)
                  .single()
                if (error || !data?.portal_token) {
                  toast.error('No se pudo generar el link del portal. Revisa que la migración portal_secure esté aplicada.')
                  return
                }
                const url = `${window.location.origin}/p/${data.portal_token}`
                navigator.clipboard.writeText(url)
                toast.success('Link copiado al portapapeles')
              }}
              className="inline-flex items-center gap-2 text-sm text-violet-700 font-medium bg-violet-100 hover:bg-violet-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Compartir con paciente
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin plan nutricional automático</h3>
          <p className="text-gray-500 mb-4">Genera un plan con comidas predefinidas, o sube una pauta en PDF y analízala con IA</p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Generar plan automático
          </button>
        </div>
      )}

      {/* ── Documentos / Pauta PDF ──────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-900">Pauta nutricional (PDF / Word)</h2>
            {planDocuments.length > 0 && (
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {planDocuments.length}
              </span>
            )}
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100">
            {uploadingDoc
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Upload className="h-3.5 w-3.5" />}
            {uploadingDoc ? 'Subiendo...' : 'Adjuntar pauta'}
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={handlePlanDocUpload}
              disabled={uploadingDoc}
            />
          </label>
        </div>

        <div className="p-6 space-y-3">
          <input
            type="text"
            value={docNotes}
            onChange={e => setDocNotes(e.target.value)}
            placeholder="Descripción del documento (opcional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />

          {docError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {docError}
            </div>
          )}

          {planDocuments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <Brain className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">Sube una pauta en PDF</p>
              <p className="text-xs text-gray-400 mt-1">
                La IA extraerá los alimentos y generará la lista de compras automáticamente
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {planDocuments.map(doc => {
                const isPdf = doc.file_name.toLowerCase().endsWith('.pdf')
                const isAnalyzing = analyzingDocId === doc.id
                return (
                  <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                          {doc.notes ? ` · ${doc.notes.replace('[PLAN] ', '')}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {/* AI analysis button — only for PDF */}
                      {isPdf && (
                        <button
                          onClick={() => handleAnalyzeDoc(doc.file_path, doc.id)}
                          disabled={isAnalyzing || !!analyzingDocId}
                          title="Analizar con IA y generar lista de compras"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 disabled:opacity-50 transition-colors"
                        >
                          {isAnalyzing
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analizando...</>
                            : <><Brain className="h-3.5 w-3.5" />Analizar con IA</>}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(doc.file_path, doc.file_name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument.mutate({ id: doc.id, filePath: doc.file_path, patientId: patientId! })}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Plan History */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Historial de planes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {plans.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No hay planes creados</div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(plan.start_date), 'dd MMM yyyy', { locale: es })} · {plan.daily_calories} kcal
                  </p>
                </div>
                {plan.is_active
                  ? <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Activo</span>
                  : <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">Inactivo</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal: Generate plan ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 my-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Nuevo plan nutricional
              </h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Elige el objetivo. Se generarán 5 comidas diarias para toda la semana.
            </p>

            <div className="space-y-3 mb-5">
              {[
                { key: 'lose_weight'  as MealObjective, emoji: '📉', label: 'Pérdida de peso',    sub: '1800 kcal · Alta saciedad'   },
                { key: 'muscle_gain'  as MealObjective, emoji: '💪', label: 'Ganancia de músculo', sub: '2600 kcal · Alta proteína'   },
                { key: 'maintain'     as MealObjective, emoji: '⚖️', label: 'Mantenimiento',       sub: '2200 kcal · Equilibrado'     },
                { key: 'medical'      as MealObjective, emoji: '🏥', label: 'Seguimiento médico',  sub: '2000 kcal · Fácil digestión' },
              ].map(({ key, emoji, label, sub }) => (
                <button
                  key={key}
                  onClick={() => setSelectedObjective(key)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedObjective === key ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{emoji}</div>
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    {selectedObjective === key && (
                      <div className="ml-auto h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4 space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Personalización (opcional)</p>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Nombre del plan"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} disabled={generatingPlan}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={generatePlanWithMeals} disabled={generatingPlan}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {generatingPlan
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Generando…</>
                  : <><Wand2 className="h-4 w-4" />Generar plan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: AI extracted foods review ─────────────────────── */}
      {showFoodsModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Alimentos extraídos</h2>
                  <p className="text-xs text-gray-500">{extractedFoods.length} ingredientes encontrados</p>
                </div>
              </div>
              <button onClick={() => setShowFoodsModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Foods list */}
            <div className="px-6 py-4 max-h-[50vh] overflow-y-auto space-y-2">
              {extractedFoods.map((food, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {editingFood === idx ? (
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        className="col-span-3 rounded border border-gray-200 px-2 py-1 text-sm"
                        value={food.food_name}
                        onChange={e => {
                          const updated = [...extractedFoods]
                          updated[idx] = { ...food, food_name: e.target.value }
                          setExtractedFoods(updated)
                        }}
                      />
                      <input
                        type="number"
                        className="rounded border border-gray-200 px-2 py-1 text-sm"
                        value={food.quantity}
                        onChange={e => {
                          const updated = [...extractedFoods]
                          updated[idx] = { ...food, quantity: Number(e.target.value) }
                          setExtractedFoods(updated)
                        }}
                      />
                      <select
                        className="rounded border border-gray-200 px-2 py-1 text-sm"
                        value={food.unit}
                        onChange={e => {
                          const updated = [...extractedFoods]
                          updated[idx] = { ...food, unit: e.target.value as FoodUnit }
                          setExtractedFoods(updated)
                        }}
                      >
                        {['g', 'ml', 'piece', 'cup', 'tbsp'].map(u => <option key={u}>{u}</option>)}
                      </select>
                      <select
                        className="rounded border border-gray-200 px-2 py-1 text-sm"
                        value={food.category}
                        onChange={e => {
                          const updated = [...extractedFoods]
                          updated[idx] = { ...food, category: e.target.value as ShoppingCategory }
                          setExtractedFoods(updated)
                        }}
                      >
                        {['protein', 'vegetables', 'fruits', 'dairy', 'grains', 'fats', 'other'].map(c => (
                          <option key={c} value={c}>{categoryLabels[c]}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{food.food_name}</span>
                        <span className="text-xs text-gray-500 ml-2">{food.quantity} {food.unit}</span>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {categoryLabels[food.category] || food.category}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingFood(editingFood === idx ? null : idx)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setExtractedFoods(extractedFoods.filter((_, i) => i !== idx))}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {docError && (
              <div className="mx-6 mb-3 flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {docError}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                Puedes editar o eliminar alimentos antes de generar la lista
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowFoodsModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">
                  Cancelar
                </button>
                <button
                  onClick={handleCreateListFromFoods}
                  disabled={creatingFromPdf || extractedFoods.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
                >
                  {creatingFromPdf
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
                    : <><ShoppingCart className="h-4 w-4" />Generar lista de compras</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
