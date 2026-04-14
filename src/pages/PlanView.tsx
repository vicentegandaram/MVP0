import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flame,
  Utensils,
  Droplets,
  Activity,
  Printer,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  usePatient,
  useActiveNutritionPlan,
  useMealsWithFoods,
  useMeasurements,
  useUpdateMeal,
  useDeleteMeal,
  useCreateMealFood,
  useUpdateMealFood,
  useDeleteMealFood
} from '../hooks/useApi'
import type { MealFood, FoodUnit, ShoppingCategory } from '../types'

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

const UNITS: FoodUnit[] = ['g', 'ml', 'piece', 'cup', 'tbsp']
const UNIT_LABELS: Record<FoodUnit, string> = {
  g: 'g',
  ml: 'ml',
  piece: 'pieza',
  cup: 'taza',
  tbsp: 'cda'
}

const CATEGORIES: ShoppingCategory[] = ['protein', 'vegetables', 'fruits', 'dairy', 'grains', 'fats', 'other']
const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  protein: 'Proteína',
  vegetables: 'Verdura',
  fruits: 'Fruta',
  dairy: 'Lácteo',
  grains: 'Cereal',
  fats: 'Grasa',
  other: 'Otro'
}

interface MealEditForm {
  name: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

interface NewFoodForm {
  food_name: string
  quantity: string
  unit: FoodUnit
  category: ShoppingCategory
}

const defaultNewFood: NewFoodForm = {
  food_name: '',
  quantity: '',
  unit: 'g',
  category: 'other'
}

export function PlanViewPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [selectedDay, setSelectedDay] = useState(1)

  // Edit state
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [mealForm, setMealForm] = useState<MealEditForm>({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null)
  const [foodQuantity, setFoodQuantity] = useState('')
  const [addingFoodToMealId, setAddingFoodToMealId] = useState<string | null>(null)
  const [newFood, setNewFood] = useState<NewFoodForm>(defaultNewFood)
  const [saving, setSaving] = useState(false)

  const { data: patient, isLoading: loadingPatient } = usePatient(patientId || '')
  const { data: activePlan, isLoading: loadingPlan } = useActiveNutritionPlan(patientId || '')
  const { data: meals = [], isLoading: loadingMeals } = useMealsWithFoods(activePlan?.id || '')
  const { data: measurements = [] } = useMeasurements(patientId || '')

  const updateMeal = useUpdateMeal()
  const deleteMeal = useDeleteMeal()
  const createMealFood = useCreateMealFood()
  const updateMealFood = useUpdateMealFood()
  const deleteMealFood = useDeleteMealFood()

  const dayMeals = meals
    .filter(m => m.day_of_week === selectedDay)
    .sort((a, b) => {
      const order = ['breakfast', 'mid_morning', 'lunch', 'afternoon', 'dinner', 'snack']
      return order.indexOf(a.meal_type) - order.indexOf(b.meal_type)
    })

  const dailyTotals = dayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const lastMeasurement = measurements[0]

  const prevDay = () => setSelectedDay(d => (d === 1 ? 7 : d - 1))
  const nextDay = () => setSelectedDay(d => (d === 7 ? 1 : d + 1))

  // ---- Meal edit handlers ----
  const startEditMeal = (meal: (typeof dayMeals)[0]) => {
    setEditingMealId(meal.id)
    setMealForm({
      name: meal.name,
      calories: String(meal.calories || ''),
      protein: String(meal.protein || ''),
      carbs: String(meal.carbs || ''),
      fat: String(meal.fat || '')
    })
    setEditingFoodId(null)
    setAddingFoodToMealId(null)
  }

  const cancelEditMeal = () => {
    setEditingMealId(null)
  }

  const saveMeal = async (mealId: string) => {
    setSaving(true)
    try {
      await updateMeal.mutateAsync({
        id: mealId,
        name: mealForm.name,
        calories: mealForm.calories ? Number(mealForm.calories) : undefined,
        protein: mealForm.protein ? Number(mealForm.protein) : undefined,
        carbs: mealForm.carbs ? Number(mealForm.carbs) : undefined,
        fat: mealForm.fat ? Number(mealForm.fat) : undefined
      })
      setEditingMealId(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!activePlan) return
    if (!window.confirm('¿Eliminar esta comida?')) return
    await deleteMeal.mutateAsync({ id: mealId, planId: activePlan.id })
    setEditingMealId(null)
  }

  // ---- Food edit handlers ----
  const startEditFood = (food: MealFood) => {
    setEditingFoodId(food.id)
    setFoodQuantity(String(food.quantity))
  }

  const saveFoodQuantity = async (food: MealFood) => {
    setSaving(true)
    try {
      await updateMealFood.mutateAsync({ id: food.id, quantity: Number(foodQuantity) })
      setEditingFoodId(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFood = async (foodId: string) => {
    if (!window.confirm('¿Eliminar este alimento?')) return
    await deleteMealFood.mutateAsync(foodId)
  }

  // ---- Add food handlers ----
  const startAddFood = (mealId: string) => {
    setAddingFoodToMealId(mealId)
    setNewFood(defaultNewFood)
    setEditingFoodId(null)
  }

  const saveNewFood = async (mealId: string) => {
    if (!newFood.food_name.trim() || !newFood.quantity) return
    setSaving(true)
    try {
      await createMealFood.mutateAsync({
        meal_id: mealId,
        food_name: newFood.food_name.trim(),
        quantity: Number(newFood.quantity),
        unit: newFood.unit,
        category: newFood.category
      })
      setAddingFoodToMealId(null)
      setNewFood(defaultNewFood)
    } finally {
      setSaving(false)
    }
  }

  if (loadingPatient || loadingPlan || loadingMeals) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
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
      <div className="flex items-center gap-4 print:hidden">
        <Link to={`/plans/${patientId}`} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Plan Nutricional</h1>
          <p className="text-gray-500">{patient?.name} {patient?.last_name} • {activePlan.name}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 print:hidden"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block text-center pb-2 border-b">
        <h1 className="text-xl font-bold">Plan Nutricional — {patient?.name} {patient?.last_name}</h1>
        <p className="text-sm text-gray-500">{activePlan.name} • {format(new Date(), "d 'de' MMMM yyyy", { locale: es })}</p>
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
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600 uppercase font-medium">Calorías diarias</p>
            <p className="text-2xl font-bold text-emerald-700">{activePlan.daily_calories} kcal</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center justify-center gap-2 print:hidden">
        <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex gap-1">
          {dayNames.map((name, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === idx + 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {name.slice(0, 3)}
            </button>
          ))}
        </div>
        <button onClick={nextDay} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">{dayNames[selectedDay - 1]}</h2>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {dayMeals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No hay comidas definidas para este día</p>
          </div>
        ) : (
          dayMeals.map(meal => {
            const isEditingMeal = editingMealId === meal.id
            const isAddingFood = addingFoodToMealId === meal.id

            return (
              <div key={meal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Meal Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                  {isEditingMeal ? (
                    <div className="space-y-3">
                      <input
                        value={mealForm.name}
                        onChange={e => setMealForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Nombre de la comida"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {(['calories', 'protein', 'carbs', 'fat'] as const).map(field => (
                          <div key={field}>
                            <label className="text-xs text-gray-500 capitalize">
                              {field === 'calories' ? 'Kcal' : field === 'protein' ? 'Prot (g)' : field === 'carbs' ? 'Carbs (g)' : 'Grasas (g)'}
                            </label>
                            <input
                              type="number"
                              value={mealForm[field]}
                              onChange={e => setMealForm(f => ({ ...f, [field]: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar comida
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditMeal}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <X className="h-3.5 w-3.5" /> Cancelar
                          </button>
                          <button
                            onClick={() => saveMeal(meal.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">
                          {mealIcons[meal.meal_type] || '🍽️'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mealLabels[meal.meal_type] || meal.meal_type}</h3>
                          <p className="text-xs text-gray-500">Hora: {mealTimes[meal.meal_type] || '--:--'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{meal.calories || 0} kcal</p>
                          <p className="text-xs text-gray-500">P: {meal.protein || 0}g • C: {meal.carbs || 0}g • G: {meal.fat || 0}g</p>
                        </div>
                        <button
                          onClick={() => startEditMeal(meal)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 print:hidden"
                          title="Editar comida"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Foods List */}
                <div className="p-4">
                  <ul className="space-y-1">
                    {meal.foods && meal.foods.length > 0 ? (
                      meal.foods.map((food: MealFood) => {
                        const isEditingThisFood = editingFoodId === food.id
                        return (
                          <li key={food.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                            <span className="text-sm text-gray-700 flex-1">{food.food_name}</span>
                            <div className="flex items-center gap-2">
                              {isEditingThisFood ? (
                                <>
                                  <input
                                    type="number"
                                    value={foodQuantity}
                                    onChange={e => setFoodQuantity(e.target.value)}
                                    className="w-20 rounded border border-gray-300 px-2 py-0.5 text-sm text-right focus:border-emerald-500 focus:outline-none"
                                    autoFocus
                                  />
                                  <span className="text-xs text-gray-500">{food.unit}</span>
                                  <button
                                    onClick={() => saveFoodQuantity(food)}
                                    disabled={saving}
                                    className="p-1 text-emerald-600 hover:text-emerald-700"
                                  >
                                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => setEditingFoodId(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm text-gray-500 font-medium">
                                    {food.quantity} {food.unit}
                                  </span>
                                  <div className="hidden group-hover:flex items-center gap-1 print:hidden">
                                    <button
                                      onClick={() => startEditFood(food)}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                      title="Editar cantidad"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFood(food.id)}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                      title="Eliminar alimento"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })
                    ) : (
                      <li className="text-gray-400 italic text-sm py-1">Sin alimentos definidos</li>
                    )}
                  </ul>

                  {/* Add food form */}
                  {isAddingFood ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFood.food_name}
                          onChange={e => setNewFood(f => ({ ...f, food_name: e.target.value }))}
                          placeholder="Nombre del alimento"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={newFood.quantity}
                          onChange={e => setNewFood(f => ({ ...f, quantity: e.target.value }))}
                          placeholder="Cant."
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        <select
                          value={newFood.unit}
                          onChange={e => setNewFood(f => ({ ...f, unit: e.target.value as FoodUnit }))}
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          {UNITS.map(u => (
                            <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={newFood.category}
                          onChange={e => setNewFood(f => ({ ...f, category: e.target.value as ShoppingCategory }))}
                          className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveNewFood(meal.id)}
                          disabled={saving || !newFood.food_name.trim() || !newFood.quantity}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Agregar
                        </button>
                        <button
                          onClick={() => setAddingFoodToMealId(null)}
                          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startAddFood(meal.id)}
                      className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-dashed border-emerald-300 transition-colors print:hidden"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar alimento
                    </button>
                  )}
                </div>
              </div>
            )
          })
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
        <h3 className="font-semibold text-blue-900 mb-3">Recomendaciones</h3>
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
            <Flame className="h-4 w-4 text-blue-600" />
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
