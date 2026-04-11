import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePatient, useNutritionPlans, useActiveNutritionPlan, useCreateNutritionPlan, useCreateMeal, useCreateMealFood } from '../hooks/useApi'
import { ChevronLeft, Plus, Calendar, Flame, Utensils, Target, X, ShoppingCart, Sparkles, Loader2, Wand2, UtensilsCrossed } from 'lucide-react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTemplatesForObjective, templateToMealData, templateFoodToMealFoodData, MealObjective } from '../data/mealTemplates'
import { supabase } from '../lib/supabase'

const planSchema = z.object({
  name: z.string().min(1, 'Nombre del plan es requerido'),
  start_date: z.string().min(1, 'Fecha de inicio requerida'),
  end_date: z.string().optional(),
  daily_calories: z.number().min(0),
  daily_protein: z.number().min(0),
  daily_carbs: z.number().min(0),
  daily_fat: z.number().min(0),
  observations: z.string().optional(),
})

type PlanForm = z.infer<typeof planSchema>

export function PlanDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [showModal, setShowModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState<MealObjective>('maintain')
  
  const { data: patient } = usePatient(patientId || '')
  const { data: plans = [] } = useNutritionPlans(patientId || '')
  const { data: activePlan } = useActiveNutritionPlan(patientId || '')
  const createPlan = useCreateNutritionPlan()
  const createMeal = useCreateMeal()
  const createMealFood = useCreateMealFood()

  const formMethods = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      daily_calories: 2000,
      daily_protein: 150,
      daily_carbs: 200,
      daily_fat: 65,
    }
  })
  const { register, handleSubmit, reset, formState: { errors } } = formMethods

  const generatePlanWithMeals = async (objective: MealObjective) => {
    setGeneratingPlan(true)
    setError(null)
    
    try {
      if (activePlan) {
        await supabase.from('nutrition_plan').update({ is_active: false }).eq('id', activePlan.id)
      }
      
      const objectiveConfig: Record<MealObjective, { calories: number; protein: number; carbs: number; fat: number }> = {
        lose_weight: { calories: 1800, protein: 140, carbs: 150, fat: 55 },
        muscle_gain: { calories: 2600, protein: 170, carbs: 300, fat: 65 },
        maintain: { calories: 2200, protein: 150, carbs: 250, fat: 65 },
        medical: { calories: 2000, protein: 120, carbs: 280, fat: 60 }
      }
      
      const config = objectiveConfig[objective]
      const objectiveLabels: Record<MealObjective, string> = {
        lose_weight: 'Pérdida de peso',
        muscle_gain: 'Ganancia de músculo',
        maintain: 'Mantenimiento',
        medical: 'Seguimiento médico'
      }
      
      const { data: plan, error: planError } = await supabase
        .from('nutrition_plan')
        .insert({
          patient_id: patientId,
          name: `Plan de ${objectiveLabels[objective]}`,
          start_date: new Date().toISOString().split('T')[0],
          daily_calories: config.calories,
          daily_protein: config.protein,
          daily_carbs: config.carbs,
          daily_fat: config.fat,
          is_active: true,
          observations: `Plan generado automáticamente para objetivo: ${objectiveLabels[objective]}`
        })
        .select()
        .single()
      
      if (planError) throw planError
      
      const templates = getTemplatesForObjective(objective)
      
      const mealTypes = ['breakfast', 'mid_morning', 'lunch', 'afternoon', 'dinner'] as const
      
      for (const dayOfWeek of [1, 2, 3, 4, 5, 6, 7]) {
        for (const mealType of mealTypes) {
          const template = templates.find(t => t.meal_type === mealType)
          if (!template) continue
          
          const { data: meal, error: mealError } = await supabase
            .from('meal')
            .insert({
              plan_id: plan.id,
              day_of_week: dayOfWeek,
              meal_type: mealType,
              name: template.name,
              calories: template.calories,
              protein: template.protein,
              carbs: template.carbs,
              fat: template.fat
            })
            .select()
            .single()
          
          if (mealError) continue
          
          for (const food of template.foods) {
            await supabase
              .from('meal_food')
              .insert({
                meal_id: meal.id,
                food_name: food.name,
                quantity: food.quantity,
                unit: food.unit,
                category: food.category
              })
          }
        }
      }
      
      setShowGenerateModal(false)
      setShowModal(false)
      reset()
      
    } catch (err: any) {
      setError(err.message || 'Error al generar el plan')
    } finally {
      setGeneratingPlan(false)
    }
  }
  
  const onSubmit = async (data: PlanForm) => {
    try {
      if (activePlan) {
        const { supabase } = await import('../lib/supabase')
        await supabase.from('nutrition_plan').update({ is_active: false }).eq('id', activePlan.id)
      }
      await createPlan.mutateAsync({
        ...data,
        patient_id: patientId || '',
        is_active: true,
        end_date: data.end_date || undefined,
      })
      setShowModal(false)
      reset()
    } catch (error: any) {
      setError(error.message || 'Error al crear el plan')
    }
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
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
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Crear nuevo plan
            </button>
          </div>
          
          {/* Botón de generar plan automático */}
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Wand2 className="h-4 w-4" />
              Generar plan con comidas
            </button>
          </div>
          
          {/* Macros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-sm">Calorías</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activePlan.daily_calories}</p>
              <p className="text-xs text-gray-500">kcal/día</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Utensils className="h-4 w-4" />
                <span className="text-sm">Proteína</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activePlan.daily_protein}g</p>
              <p className="text-xs text-gray-500">/día</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Utensils className="h-4 w-4" />
                <span className="text-sm">Carbs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activePlan.daily_carbs}g</p>
              <p className="text-xs text-gray-500">/día</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Utensils className="h-4 w-4" />
                <span className="text-sm">Grasas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activePlan.daily_fat}g</p>
              <p className="text-xs text-gray-500">/día</p>
            </div>
          </div>

            {activePlan.observations && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">{activePlan.observations}</p>
            </div>
          )}

          {/* Botón de lista de compras */}
          <div className="mt-4 pt-4 border-t border-emerald-200 flex gap-3">
            <Link
              to={`/plans/${patientId}/view`}
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Ver plan completo
            </Link>
            <Link
              to={`/plans/${patientId}/shopping`}
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Lista de compras
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin plan nutricional</h3>
          <p className="text-gray-500 mb-4">Crea un plan para este paciente</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Crear plan
          </button>
        </div>
      )}

      {/* Plans History */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Historial de planes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {plans.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No hay planes creados
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(plan.start_date), 'dd MMM yyyy', { locale: es })} - {plan.daily_calories} kcal
                  </p>
                </div>
                {plan.is_active ? (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Activo
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Inactivo
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Plan Nutricional</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del plan</label>
                <input
                  {...register('name')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ej: Plan de pérdida de peso"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    {...register('start_date')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin (opcional)</label>
                  <input
                    type="date"
                    {...register('end_date')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calorías/día</label>
                  <input
                    type="number"
                    {...register('daily_calories', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    {...register('daily_protein', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbohidratos (g)</label>
                  <input
                    type="number"
                    {...register('daily_carbs', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grasas (g)</label>
                  <input
                    type="number"
                    {...register('daily_fat', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  {...register('observations')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Notas adicionales..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Crear plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Plan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Generar Plan Automático
              </h2>
              <button onClick={() => setShowGenerateModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el objetivo del paciente para generar un plan completo con todas las comidas de la semana.
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedObjective('lose_weight')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedObjective === 'lose_weight' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl">📉</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pérdida de peso</p>
                    <p className="text-xs text-gray-500">1800 kcal - Alta saciedad</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedObjective('muscle_gain')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedObjective === 'muscle_gain' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">💪</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ganancia de músculo</p>
                    <p className="text-xs text-gray-500">2800 kcal - Alta proteína</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedObjective('maintain')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedObjective === 'maintain' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">⚖️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mantenimiento</p>
                    <p className="text-xs text-gray-500">2200 kcal - Equilibrado</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedObjective('medical')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedObjective === 'medical' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">🏥</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Seguimiento médico</p>
                    <p className="text-xs text-gray-500">2000 kcal - Fácil digestión</p>
                  </div>
                </div>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => generatePlanWithMeals(selectedObjective)}
                disabled={generatingPlan}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generar Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
