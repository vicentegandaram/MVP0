import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Flame,
  Utensils,
  Droplets,
  Activity,
  Printer,
  X,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePatient, useActiveNutritionPlan, useMealsWithFoods, useMeasurements } from '../hooks/useApi'

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const mealTimes: Record<string, string> = {
  breakfast: '08:00',
  mid_morning: '11:00',
  lunch: '14:00',
  afternoon: '17:30',
  dinner: '21:00',
  snack: '10:00'
}

const mealLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  mid_morning: 'Media mañana',
  lunch: 'Almuerzo',
  afternoon: 'Merienda',
  dinner: 'Cena',
  snack: 'Snack'
}

const mealIcons: Record<string, string> = {
  breakfast: '🥣',
  mid_morning: '☕',
  lunch: '🍽️',
  afternoon: '🍪',
  dinner: '🌙',
  snack: '🍎'
}

export function PlanViewPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [selectedDay, setSelectedDay] = useState(1)
  
  const { data: patient, isLoading: loadingPatient } = usePatient(patientId || '')
  const { data: activePlan, isLoading: loadingPlan } = useActiveNutritionPlan(patientId || '')
  const { data: meals = [], isLoading: loadingMeals } = useMealsWithFoods(activePlan?.id || '')
  const { data: measurements = [] } = useMeasurements(patientId || '')

  const dayMeals = meals.filter(m => m.day_of_week === selectedDay)
    .sort((a, b) => {
      const order = ['breakfast', 'mid_morning', 'lunch', 'afternoon', 'dinner', 'snack']
      return order.indexOf(a.meal_type) - order.indexOf(b.meal_type)
    })

  const dailyTotals = dayMeals.reduce((acc, meal) => ({
    calories: (acc.calories || 0) + (meal.calories || 0),
    protein: (acc.protein || 0) + (meal.protein || 0),
    carbs: (acc.carbs || 0) + (meal.carbs || 0),
    fat: (acc.fat || 0) + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const lastMeasurement = measurements[0]
  const currentWeight = lastMeasurement?.weight || activePlan?.daily_calories

  const prevDay = () => setSelectedDay(d => d === 1 ? 7 : d - 1)
  const nextDay = () => setSelectedDay(d => d === 7 ? 1 : d + 1)

  if (loadingPatient || loadingPlan || loadingMeals) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No hay plan activo para este paciente</p>
          <Link to={`/plans/${patientId}`} className="text-emerald-600 hover:text-emerald-700">
            Volver al plan →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/plans/${patientId}`} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Plan Nutricional</h1>
          <p className="text-gray-500">{patient?.name} {patient?.last_name} • {activePlan.name}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
      </div>

      {/* Patient Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-emerald-600 uppercase font-medium">Paciente</p>
              <p className="text-sm font-semibold text-gray-900">{patient?.name} {patient?.last_name}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase font-medium">Peso actual</p>
              <p className="text-sm font-semibold text-gray-900">{lastMeasurement?.weight || '-'} kg</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase font-medium">IMC</p>
              <p className="text-sm font-semibold text-gray-900">{lastMeasurement?.imc?.toFixed(1) || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase font-medium">Objetivo</p>
              <p className="text-sm font-semibold text-gray-900">{activePlan.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600 uppercase font-medium">Calorías diarias</p>
            <p className="text-2xl font-bold text-emerald-700">{activePlan.daily_calories} kcal</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={prevDay}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex gap-1">
          {dayNames.map((name, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === idx + 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {name.slice(0, 3)}
            </button>
          ))}
        </div>
        <button
          onClick={nextDay}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">{dayNames[selectedDay - 1]}</h2>
        <p className="text-sm text-gray-500">{format(new Date(), "d 'de' MMMM yyyy", { locale: es })}</p>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {dayMeals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No hay comidas definidas para este día</p>
          </div>
        ) : (
          dayMeals.map((meal) => {
            const mealIcon = mealIcons[meal.meal_type] || '🍽️'
            return (
            <div key={meal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Meal Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">
                    {mealIcon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mealLabels[meal.meal_type] || meal.meal_type}</h3>
                    <p className="text-xs text-gray-500">Hora: {mealTimes[meal.meal_type] || '--:--'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{meal.calories || 0} kcal</p>
                  <p className="text-xs text-gray-500">P: {meal.protein || 0}g • C: {meal.carbs || 0}g • G: {meal.fat || 0}g</p>
                </div>
              </div>

              {/* Foods List */}
              <div className="p-4">
                <ul className="space-y-2">
                  {meal.foods && meal.foods.length > 0 ? (
                    meal.foods.map((food: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between py-1">
                        <span className="text-gray-700">{food.food_name}</span>
                        <span className="text-sm text-gray-500 font-medium">
                          {food.quantity} {food.unit}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic">Sin alimentos definidos</li>
                  )}
                </ul>
              </div>
            </div>
            )})
        )}
      </div>

      {/* Daily Totals */}
      {dayMeals.length > 0 && (
        <div className="bg-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">TOTAL DEL DÍA</span>
            <span className="text-2xl font-bold">{dailyTotals.calories} kcal</span>
          </div>
          <div className="flex gap-4 text-sm opacity-90">
            <span>🥩 Proteína: {dailyTotals.protein}g</span>
            <span>🍚 Carbs: {dailyTotals.carbs}g</span>
            <span>🥑 Grasas: {dailyTotals.fat}g</span>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Recomendaciones</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            <span>Agua: 2-3 litros diarios</span>
          </li>
          <li className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Ejercicio: 30 minutos de actividad física moderada</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">⏰</span>
            <span>Cena antes de las 21:30</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">❌</span>
            <span>No saltar comidas</span>
          </li>
        </ul>
      </div>

      {/* Footer for print */}
      <div className="hidden print:block text-center text-xs text-gray-400 pt-4 border-t">
        <p>Plan generado por NutriFlow • {format(new Date(), 'dd/MM/yyyy')}</p>
      </div>
    </div>
  )
}