import { useState, useEffect, type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import {
  Flame, Utensils, Droplets, Activity,
  ChevronLeft, ChevronRight,
  ShoppingCart, CheckCircle2, Circle,
  ChevronDown, ChevronUp, X, MinusCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

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

const categoryLabels: Record<string, string> = {
  protein: 'Proteínas',
  vegetables: 'Verduras',
  fruits: 'Frutas',
  dairy: 'Lácteos',
  grains: 'Cereales y tubérculos',
  fats: 'Grasas y aceites',
  other: 'Otros'
}

const categoryIcons: Record<string, string> = {
  protein: '🥩',
  vegetables: '🥦',
  fruits: '🍎',
  dairy: '🥛',
  grains: '🍚',
  fats: '🫒',
  other: '📦'
}

interface PatientData {
  name: string
  last_name?: string
}

interface PlanData {
  id: string
  name: string
  start_date: string
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  observations?: string
}

interface MealData {
  id: string
  day_of_week: number
  meal_type: string
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  foods: { id: string; food_name: string; quantity: number; unit: string }[]
}

interface ShoppingItemData {
  id: string
  food_name: string
  quantity: number
  unit: string
  category: string
  is_purchased: boolean
}

interface ShoppingListData {
  id: string
  name: string
  items: ShoppingItemData[]
}

type MealStatus = 'completed' | 'partial' | 'missed' | 'skipped'

interface MealLogEntry {
  meal_id: string
  log_date: string
  status: MealStatus
}

interface PortalBundle {
  patient: PatientData & { id: string }
  plan: PlanData | null
  meals: MealData[]
  shopping_list: ShoppingListData | null
  meal_logs: MealLogEntry[]
  week_start: string
}

export function PatientPortalPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [meals, setMeals] = useState<MealData[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingListData | null>(null)
  const [mealLogs, setMealLogs] = useState<MealLogEntry[]>([])
  const [weekStart, setWeekStart] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay()
    return today === 0 ? 7 : today
  })
  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token])

  const loadData = async () => {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('portal_get_bundle', { p_token: token! })

      if (rpcError) throw new Error(rpcError.message)
      if (!data) throw new Error('Enlace no válido o expirado')

      const bundle = data as PortalBundle
      setPatient(bundle.patient)
      setPlan(bundle.plan)
      setMeals(bundle.meals || [])
      setShoppingList(bundle.shopping_list)
      setMealLogs(bundle.meal_logs || [])
      setWeekStart(bundle.week_start)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar los datos'))
    } finally {
      setLoading(false)
    }
  }

  const togglePurchased = async (itemId: string, current: boolean) => {
    setShoppingList(prev => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, is_purchased: !current } : i)
      }
    })

    const { error: rpcError } = await supabase
      .rpc('portal_toggle_shopping_item', { p_token: token!, p_item_id: itemId })

    if (rpcError) {
      setShoppingList(prev => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map(i => i.id === itemId ? { ...i, is_purchased: current } : i)
        }
      })
    }
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  // Devuelve la fecha (YYYY-MM-DD) del día seleccionado de esta semana
  const dateForDay = (day: number): string => {
    if (!weekStart) return ''
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + (day - 1))
    return d.toISOString().slice(0, 10)
  }

  const getMealStatus = (mealId: string, day: number): MealStatus | null => {
    const logDate = dateForDay(day)
    const log = mealLogs.find(l => l.meal_id === mealId && l.log_date === logDate)
    return log?.status ?? null
  }

  const setMealStatus = async (mealId: string, day: number, next: MealStatus | null) => {
    const logDate = dateForDay(day)
    const prev = mealLogs

    // Optimistic update
    setMealLogs(curr => {
      const filtered = curr.filter(l => !(l.meal_id === mealId && l.log_date === logDate))
      return next ? [...filtered, { meal_id: mealId, log_date: logDate, status: next }] : filtered
    })

    const { error: rpcError } = await supabase.rpc('portal_log_meal', {
      p_token: token!,
      p_meal_id: mealId,
      p_log_date: logDate,
      p_status: next,
    })

    if (rpcError) {
      // Revertir
      setMealLogs(prev)
    }
  }

  const prevDay = () => setSelectedDay(d => (d === 1 ? 7 : d - 1))
  const nextDay = () => setSelectedDay(d => (d === 7 ? 1 : d + 1))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Cargando tu plan...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No se pudo cargar</h1>
          <p className="text-gray-500">{error || 'Paciente no encontrado'}</p>
        </div>
      </div>
    )
  }

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

  // Group shopping items by category
  const shoppingGroups: { category: string; items: ShoppingItemData[] }[] = []
  if (shoppingList) {
    const grouped = shoppingList.items.reduce((acc, item) => {
      const cat = item.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ShoppingItemData[]>)
    Object.entries(grouped).forEach(([category, items]) => {
      shoppingGroups.push({ category, items })
    })
  }

  const totalItems = shoppingList?.items?.length || 0
  const purchasedItems = shoppingList?.items?.filter(i => i.is_purchased).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-700">{patient.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-medium">Mi Plan Nutricional</p>
              <h1 className="text-lg font-bold text-gray-900">{patient.name} {patient.last_name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'plan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Utensils className="h-4 w-4" />
            Mi Plan
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'shopping' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Compras
            {totalItems > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                {purchasedItems}/{totalItems}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB: Plan ── */}
        {activeTab === 'plan' && (
          <>
            {!plan ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tu nutricionista aún no ha creado un plan</p>
              </div>
            ) : (
              <>
                {/* Plan summary */}
                <div className="bg-emerald-600 rounded-2xl p-5 text-white">
                  <p className="text-emerald-200 text-sm font-medium">{plan.name}</p>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                      { icon: <Flame className="h-4 w-4" />, val: plan.daily_calories, label: 'kcal' },
                      { icon: <span className="text-sm">🥩</span>, val: `${plan.daily_protein}g`, label: 'prot' },
                      { icon: <span className="text-sm">🍚</span>, val: `${plan.daily_carbs}g`, label: 'carbs' },
                      { icon: <span className="text-sm">🥑</span>, val: `${plan.daily_fat}g`, label: 'grasas' },
                    ].map(({ icon, val, label }) => (
                      <div key={label} className="text-center">
                        <div className="flex items-center justify-center mb-1">{icon}</div>
                        <p className="text-lg font-bold">{val}</p>
                        <p className="text-xs text-emerald-200">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day selector */}
                <div className="flex items-center justify-center gap-2">
                  <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="flex gap-1">
                    {dayNames.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(idx + 1)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
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

                <h2 className="text-center text-lg font-bold text-gray-900">{dayNames[selectedDay - 1]}</h2>

                {/* Meals */}
                <div className="space-y-4">
                  {dayMeals.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-gray-200">
                      <p className="text-gray-400">No hay comidas para este día</p>
                    </div>
                  ) : (
                    dayMeals.map(meal => {
                      const status = getMealStatus(meal.id, selectedDay)
                      const statusButtons: { value: MealStatus; label: string; icon: ReactElement; activeClass: string }[] = [
                        { value: 'completed', label: 'Hecha',  icon: <CheckCircle2 className="h-4 w-4" />, activeClass: 'bg-emerald-600 text-white border-emerald-600' },
                        { value: 'partial',   label: 'Parcial', icon: <MinusCircle className="h-4 w-4" />, activeClass: 'bg-amber-500 text-white border-amber-500' },
                        { value: 'missed',    label: 'No hecha', icon: <X className="h-4 w-4" />,            activeClass: 'bg-red-500 text-white border-red-500' },
                      ]
                      return (
                        <div key={meal.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{mealIcons[meal.meal_type] || '🍽️'}</span>
                              <div>
                                <h3 className="font-semibold text-gray-900">{mealLabels[meal.meal_type] || meal.name}</h3>
                                {meal.calories ? (
                                  <p className="text-xs text-gray-500">
                                    {meal.calories} kcal · P:{meal.protein || 0}g · C:{meal.carbs || 0}g · G:{meal.fat || 0}g
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <ul className="p-4 space-y-1.5">
                            {meal.foods.length > 0 ? (
                              meal.foods.map(food => (
                                <li key={food.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{food.food_name}</span>
                                  <span className="text-gray-400 font-medium">{food.quantity} {food.unit}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-400 text-sm italic">Sin alimentos detallados</li>
                            )}
                          </ul>
                          <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
                            {statusButtons.map(({ value, label, icon, activeClass }) => {
                              const isActive = status === value
                              return (
                                <button
                                  key={value}
                                  onClick={() => setMealStatus(meal.id, selectedDay, isActive ? null : value)}
                                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                    isActive ? activeClass : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  {icon}
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Daily totals */}
                {dayMeals.length > 0 && (
                  <div className="bg-emerald-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">TOTAL DEL DÍA</span>
                      <span className="text-xl font-bold">{dailyTotals.calories} kcal</span>
                    </div>
                    <div className="flex gap-4 text-xs opacity-80">
                      <span>Proteína: {dailyTotals.protein}g</span>
                      <span>Carbs: {dailyTotals.carbs}g</span>
                      <span>Grasas: {dailyTotals.fat}g</span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 text-sm">Recomendaciones</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Beber 2-3 litros de agua al día
                    </li>
                    <li className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      30 minutos de actividad física diaria
                    </li>
                    <li className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-blue-500" />
                      No saltar comidas
                    </li>
                  </ul>
                  {plan.observations && (
                    <p className="mt-3 text-sm text-blue-700 border-t border-blue-200 pt-3">{plan.observations}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB: Lista de compras ── */}
        {activeTab === 'shopping' && (
          <>
            {!shoppingList || shoppingList.items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aún no hay lista de compras</p>
                <p className="text-sm text-gray-400 mt-1">Tu nutricionista la generará pronto</p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso de compras</span>
                    <span className="text-sm text-gray-500">{purchasedItems} / {totalItems}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0}%` }}
                    />
                  </div>
                  {purchasedItems === totalItems && totalItems > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-2 text-center">
                      ¡Lista completa! 🎉
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  {shoppingGroups.map(group => (
                    <div key={group.category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleCategory(group.category)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{categoryIcons[group.category] || '📦'}</span>
                          <span className="font-medium text-gray-900">
                            {categoryLabels[group.category] || group.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({group.items.filter(i => i.is_purchased).length}/{group.items.length})
                          </span>
                        </div>
                        {expandedCategories[group.category] === false
                          ? <ChevronDown className="h-5 w-5 text-gray-400" />
                          : <ChevronUp className="h-5 w-5 text-gray-400" />}
                      </button>

                      {expandedCategories[group.category] !== false && (
                        <div className="border-t border-gray-100 px-4 py-2 space-y-1">
                          {group.items.map(item => (
                            <button
                              key={item.id}
                              onClick={() => togglePurchased(item.id, item.is_purchased)}
                              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {item.is_purchased
                                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                  : <Circle className="h-5 w-5 text-gray-300" />}
                                <span className={`text-sm ${item.is_purchased ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {item.food_name}
                                </span>
                              </div>
                              <span className="text-sm text-gray-400">{item.quantity} {item.unit}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">
            Creado con <span className="font-semibold text-emerald-600">NutriFlow</span>
          </p>
        </div>
      </div>
    </div>
  )
}
