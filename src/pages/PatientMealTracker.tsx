import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Calendar,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { format, addDays, subDays, startOfWeek, isSameDay, isAfter, isBefore, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import type { Meal, MealLog, NutritionPlan } from '../types'

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Desayuno', short: 'D', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { key: 'mid_morning', label: 'Media mañana', short: 'M', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { key: 'lunch', label: 'Almuerzo', short: 'A', color: 'bg-red-100 text-red-700 border-red-300' },
  { key: 'afternoon', label: 'Merienda', short: 'Me', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'dinner', label: 'Cena', short: 'C', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { key: 'snack', label: 'Snack', short: 'S', color: 'bg-pink-100 text-pink-700 border-pink-300' },
]

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface MealWithLog extends Meal {
  log?: MealLog
  status: 'completed' | 'partial' | 'missed' | 'skipped' | null
}

export function PatientMealTrackerPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [patient, setPatient] = useState<{ name: string; last_name: string } | null>(null)
  const [activePlan, setActivePlan] = useState<NutritionPlan | null>(null)
  const [mealsWithLogs, setMealsWithLogs] = useState<MealWithLog[][]>([])
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [adherence, setAdherence] = useState({ weekly: 0, monthly: 0 })

  useEffect(() => {
    if (patientId) {
      loadData()
    }
  }, [patientId, currentDate])

  useEffect(() => {
    const dates = []
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i))
    }
    setWeekDates(dates)
  }, [currentDate])

  const loadData = async () => {
    if (!patientId) return
    setLoading(true)

    try {
      const { data: patientData } = await supabase
        .from('patient')
        .select('name, last_name')
        .eq('id', patientId)
        .single()
      
      if (patientData) {
        setPatient(patientData)
      }

      const { data: planData } = await supabase
        .from('nutrition_plan')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single()
      
      if (planData) {
        setActivePlan(planData)

        const { data: mealsData } = await supabase
          .from('meal')
          .select('*')
          .eq('plan_id', planData.id)
          .order('day_of_week')
          .order('meal_type')
        
        const { data: logsData } = await supabase
          .from('meal_log')
          .select('*')
          .eq('patient_id', patientId)
          .gte('log_date', format(weekDates[0], 'yyyy-MM-dd'))
          .lte('log_date', format(weekDates[6], 'yyyy-MM-dd'))
        
        const mealsGrouped: MealWithLog[][] = []
        for (let day = 1; day <= 7; day++) {
          const dayMeals = (mealsData || [])
            .filter(m => m.day_of_week === day)
            .map(meal => {
              const log = logsData?.find(l => 
                l.meal_id === meal.id && 
                l.log_date === format(currentDate, 'yyyy-MM-dd')
              )
              return {
                ...meal,
                log,
                status: log?.status || null
              } as MealWithLog
            })
          mealsGrouped.push(dayMeals)
        }
        setMealsWithLogs(mealsGrouped)
      }

      await loadAdherence()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAdherence = async () => {
    if (!patientId) return

    const now = new Date()
    const weekAgo = subDays(now, 7)
    const monthAgo = subDays(now, 30)

    const weekly = await calculateAdherence(patientId, weekAgo, now)
    const monthly = await calculateAdherence(patientId, monthAgo, now)

    setAdherence({ weekly, monthly })
  }

  const calculateAdherence = async (pId: string, start: Date, end: Date) => {
    const { data } = await supabase
      .from('meal_log')
      .select('status')
      .eq('patient_id', pId)
      .gte('log_date', format(start, 'yyyy-MM-dd'))
      .lte('log_date', format(end, 'yyyy-MM-dd'))
    
    if (!data || data.length === 0) return 0
    
    const completed = data.filter(l => l.status === 'completed').length
    const partial = data.filter(l => l.status === 'partial').length
    const total = data.length
    
    return Math.round(((completed + partial * 0.5) / total) * 100)
  }

  const updateMealStatus = async (mealId: string, status: 'completed' | 'partial' | 'missed' | 'skipped' | null) => {
    if (!patientId || !currentDate) return

    setSaving(true)
    try {
      const logDate = format(currentDate, 'yyyy-MM-dd')

      if (status === null) {
        await supabase
          .from('meal_log')
          .delete()
          .eq('patient_id', patientId)
          .eq('meal_id', mealId)
          .eq('log_date', logDate)
      } else {
        const { data: existing } = await supabase
          .from('meal_log')
          .select('id')
          .eq('patient_id', patientId)
          .eq('meal_id', mealId)
          .eq('log_date', logDate)
          .single()
        
        if (existing) {
          await supabase
            .from('meal_log')
            .update({ status, logged_at: new Date().toISOString() })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('meal_log')
            .insert({
              patient_id: patientId,
              meal_id: mealId,
              log_date: logDate,
              status,
              logged_at: new Date().toISOString()
            })
        }
      }

      await loadData()
    } catch (error) {
      console.error('Error updating meal:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500'
      case 'partial':
        return 'bg-orange-500'
      case 'missed':
        return 'bg-red-500'
      case 'skipped':
        return 'bg-gray-400'
      default:
        return 'bg-gray-200'
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-white" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-white" />
      case 'missed':
        return <XCircle className="w-5 h-5 text-white" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getMealsForDay = (dayIndex: number) => {
    return mealsWithLogs[dayIndex] || []
  }

  const getMealByType = (meals: MealWithLog[], type: string) => {
    return meals.find(m => m.meal_type === type)
  }

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/patients/${patientId}`} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Seguimiento de comidas
          </h1>
          <p className="text-gray-500">
            {patient?.name} {patient?.last_name}
          </p>
        </div>
      </div>

      {activePlan && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-gray-900">{activePlan.name}</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Calorías</p>
              <p className="font-bold text-gray-900">{activePlan.daily_calories}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Proteína</p>
              <p className="font-bold text-gray-900">{activePlan.daily_protein}g</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Carbs</p>
              <p className="font-bold text-gray-900">{activePlan.daily_carbs}g</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Grasas</p>
              <p className="font-bold text-gray-900">{activePlan.daily_fat}g</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-500">Esta semana</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{adherence.weekly}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${adherence.weekly}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{adherence.monthly}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${adherence.monthly}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(subDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">
              {format(weekDates[0], 'dd MMM')} - {format(weekDates[6], 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-100"
            disabled={isAfter(currentDate, new Date())}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-8 gap-1">
          <div className="col-span-1"></div>
          {weekDates.map((date, idx) => (
            <div
              key={idx}
              className={`text-center py-2 rounded-lg ${
                isSameDay(date, currentDate)
                  ? 'bg-emerald-100 text-emerald-700'
                  : isSameDay(date, new Date())
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600'
              }`}
            >
              <p className="text-xs font-medium">{DAY_NAMES[idx]}</p>
              <p className="text-sm font-bold">{format(date, 'd')}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType.key} className="grid grid-cols-8 gap-1 items-center">
              <div className="col-span-1 py-3 px-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${mealType.color}`}>
                  {mealType.short}
                </span>
              </div>
              {weekDates.map((date, dayIdx) => {
                const meals = getMealsForDay(dayIdx)
                const meal = getMealByType(meals, mealType.key)
                const isToday = isSameDay(date, new Date())
                const isPast = isBefore(date, new Date()) && !isSameDay(date, new Date())
                const isFuture = isAfter(date, new Date())

                return (
                  <button
                    key={dayIdx}
                    onClick={() => meal && updateMealStatus(meal.id, null)}
                    className={`
                      relative py-3 px-2 rounded-lg transition-all min-h-[60px]
                      ${getStatusColor(meal?.status || null)}
                      ${!meal ? 'bg-gray-50' : ''}
                      ${isToday && !meal?.status ? 'ring-2 ring-emerald-300' : ''}
                    `}
                    disabled={!meal || saving}
                  >
                    {meal ? (
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(meal.status)}
                        {meal.status === 'partial' && (
                          <span className="text-xs text-white font-medium">50%</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">LEYENDA</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span>Parcial (50%)</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Perdido</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-300" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Registrar comida de hoy</h3>
        <p className="text-sm text-gray-500 mb-3">
          Selecciona el estado de cada comida para el día {format(currentDate, 'EEEE d MMMM', { locale: es })}
        </p>

        {mealsWithLogs[weekDates.findIndex(d => isSameDay(d, currentDate))]?.length > 0 ? (
          <div className="space-y-2">
            {MEAL_TYPES.map((mealType) => {
              const dayIdx = weekDates.findIndex(d => isSameDay(d, currentDate))
              const meals = getMealsForDay(dayIdx)
              const meal = getMealByType(meals, mealType.key)

              if (!meal) return null

              return (
                <div key={mealType.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{mealType.label}</p>
                    <p className="text-sm text-gray-500">{meal.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {(['completed', 'partial', 'missed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateMealStatus(meal.id, status)}
                        disabled={saving}
                        className={`
                          px-3 py-1 rounded-lg text-sm font-medium transition-all
                          ${meal.status === status
                            ? getStatusColor(status) + ' text-white'
                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        {status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                        {status === 'partial' && <AlertCircle className="w-4 h-4" />}
                        {status === 'missed' && <XCircle className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Utensils className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No hay plan nutricional activo</p>
            <Link
              to={`/plans/${patientId}`}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Crear plan nutricional →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}