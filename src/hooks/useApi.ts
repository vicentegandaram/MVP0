import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store'
import type { 
  Patient, 
  PatientGoal, 
  PatientPreference, 
  Measurement, 
  NutritionPlan, 
  Meal, 
  MealFood,
  ShoppingList,
  ShoppingItem,
  MealLog,
  Appointment,
  ChartDataPoint
} from '../types'

// ============ PACIENTES ============

export const usePatients = () => {
  const nutritionistId = useAuthStore((state) => state.nutritionist?.id)
  
  return useQuery({
    queryKey: ['patients', nutritionistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient')
        .select('*')
        .eq('nutritionist_id', nutritionistId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Patient[]
    },
    enabled: !!nutritionistId,
  })
}

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Patient
    },
    enabled: !!id,
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  const nutritionistId = useAuthStore((state) => state.nutritionist?.id)
  
  return useMutation({
    mutationFn: async (patient: Partial<Patient>) => {
      const { data, error } = await supabase
        .from('patient')
        .insert({
          ...patient,
          nutritionist_id: nutritionistId
        })
        .select()
        .single()
      if (error) throw error
      return data as Patient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patient }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patient')
        .update(patient)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Patient
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] })
    },
  })
}

export const useDeletePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patient')
        .update({ is_active: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

// ============ METAS DEL PACIENTE ============

export const usePatientGoals = (patientId: string) => {
  return useQuery({
    queryKey: ['patientGoals', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_goal')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as PatientGoal[]
    },
    enabled: !!patientId,
  })
}

export const useCreatePatientGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (goal: Partial<PatientGoal>) => {
      const { data, error } = await supabase
        .from('patient_goal')
        .insert(goal)
        .select()
        .single()
      if (error) throw error
      return data as PatientGoal
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patientGoals', variables.patient_id] })
    },
  })
}

// ============ PREFERENCIAS DEL PACIENTE ============

export const usePatientPreferences = (patientId: string) => {
  return useQuery({
    queryKey: ['patientPreferences', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_preference')
        .select('*')
        .eq('patient_id', patientId)
      if (error) throw error
      return data as PatientPreference[]
    },
    enabled: !!patientId,
  })
}

export const useCreatePatientPreference = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pref: Partial<PatientPreference>) => {
      const { data, error } = await supabase
        .from('patient_preference')
        .insert(pref)
        .select()
        .single()
      if (error) throw error
      return data as PatientPreference
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patientPreferences', variables.patient_id] })
    },
  })
}

export const useDeletePatientPreference = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patient_preference')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientPreferences'] })
    },
  })
}

// ============ MEDICIONES ============

export const useMeasurements = (patientId: string) => {
  return useQuery({
    queryKey: ['measurements', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurement')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
      if (error) throw error
      return data as Measurement[]
    },
    enabled: !!patientId,
  })
}

export const useMeasurementChart = (patientId: string) => {
  return useQuery({
    queryKey: ['measurementChart', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_patient_evolution_chart', {
          p_patient_id: patientId,
          p_start_date: '2020-01-01',
          p_end_date: new Date().toISOString().split('T')[0]
        })
      if (error) throw error
      return data as ChartDataPoint[]
    },
    enabled: !!patientId,
  })
}

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (measurement: Partial<Measurement>) => {
      const { data, error } = await supabase
        .from('measurement')
        .insert(measurement)
        .select()
        .single()
      if (error) throw error
      return data as Measurement
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', variables.patient_id] })
      queryClient.invalidateQueries({ queryKey: ['measurementChart', variables.patient_id] })
    },
  })
}

// ============ CITAS ============

export const useAppointments = (filters?: { date?: string; status?: string }) => {
  const nutritionistId = useAuthStore((state) => state.nutritionist?.id)
  
  return useQuery({
    queryKey: ['appointments', nutritionistId, filters],
    queryFn: async () => {
      let query = supabase
        .from('appointment')
        .select(`
          *,
          patient:patient(name, last_name)
        `)
        .eq('nutritionist_id', nutritionistId)
        .order('scheduled_at', { ascending: true })
      
      if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`
        const endOfDay = `${filters.date}T23:59:59`
        query = query.gte('scheduled_at', startOfDay).lte('scheduled_at', endOfDay)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Appointment[]
    },
    enabled: !!nutritionistId,
  })
}

export const useAppointmentsForPatient = (patientId: string) => {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return data as Appointment[]
    },
    enabled: !!patientId,
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (appointment: Partial<Appointment>) => {
      const { data, error } = await supabase
        .from('appointment')
        .insert(appointment)
        .select()
        .single()
      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...appointment }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointment')
        .update(appointment)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

// ============ PLANES NUTRICIONALES ============

export const useNutritionPlans = (patientId: string) => {
  return useQuery({
    queryKey: ['nutritionPlans', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_plan')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as NutritionPlan[]
    },
    enabled: !!patientId,
  })
}

export const useActiveNutritionPlan = (patientId: string) => {
  return useQuery({
    queryKey: ['nutritionPlan', 'active', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_plan')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as NutritionPlan | null
    },
    enabled: !!patientId,
  })
}

export const useNutritionPlanDetail = (planId: string) => {
  return useQuery({
    queryKey: ['nutritionPlan', planId],
    queryFn: async () => {
      const { data: plan, error } = await supabase
        .from('nutrition_plan')
        .select('*')
        .eq('id', planId)
        .single()
      if (error) throw error
      
      const { data: meals, error: mealsError } = await supabase
        .from('meal')
        .select('*')
        .eq('plan_id', planId)
        .order('day_of_week')
        .order('meal_type')
      if (mealsError) throw mealsError
      
      const mealIds = meals.map(m => m.id)
      const { data: foods, error: foodsError } = await supabase
        .from('meal_food')
        .select('*')
        .in('meal_id', mealIds)
      if (foodsError) throw foodsError
      
      const { data: alternatives, error: altError } = await supabase
        .from('food_alternative')
        .select('*')
        .in('meal_food_id', foods.map(f => f.id))
      if (altError) throw altError
      
      const mealsWithFoods = meals.map(meal => ({
        ...meal,
        foods: foods
          .filter(f => f.meal_id === meal.id)
          .map(f => ({
            ...f,
            alternatives: alternatives.filter(a => a.meal_food_id === f.id)
          }))
      })) as Meal[]
      
      return { plan, meals: mealsWithFoods }
    },
    enabled: !!planId,
  })
}

export const useCreateNutritionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plan: Partial<NutritionPlan>) => {
      const { data, error } = await supabase
        .from('nutrition_plan')
        .insert(plan)
        .select()
        .single()
      if (error) throw error
      return data as NutritionPlan
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlans', variables.patient_id] })
    },
  })
}

export const useUpdateNutritionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...plan }: Partial<NutritionPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('nutrition_plan')
        .update(plan)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as NutritionPlan
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlans'] })
    },
  })
}

// ============ COMIDAS Y ALIMENTOS ============

export const useMeals = (planId: string) => {
  return useQuery({
    queryKey: ['meals', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal')
        .select('*')
        .eq('plan_id', planId)
        .order('day_of_week', { ascending: true })
        .order('meal_type', { ascending: true })
      if (error) throw error
      return data as Meal[]
    },
    enabled: !!planId,
  })
}

export const useMealsWithFoods = (planId: string) => {
  return useQuery({
    queryKey: ['mealsWithFoods', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal')
        .select('*, meal_food(*)')
        .eq('plan_id', planId)
        .order('day_of_week', { ascending: true })
        .order('meal_type', { ascending: true })

      if (error) throw error

      return (data || []).map(meal => ({
        ...meal,
        foods: (meal.meal_food || []) as MealFood[],
        meal_food: undefined,
      })) as (Meal & { foods: MealFood[] })[]
    },
    enabled: !!planId,
  })
}

export const useCreateMeal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (meal: Partial<Meal>) => {
      const { data, error } = await supabase
        .from('meal')
        .insert(meal)
        .select()
        .single()
      if (error) throw error
      return data as Meal
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan', data.plan_id] })
    },
  })
}

export const useUpdateMeal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...meal }: Partial<Meal> & { id: string }) => {
      const { data, error } = await supabase
        .from('meal')
        .update(meal)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Meal
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan', data.plan_id] })
      queryClient.invalidateQueries({ queryKey: ['mealsWithFoods', data.plan_id] })
      queryClient.invalidateQueries({ queryKey: ['meals', data.plan_id] })
    },
  })
}

export const useDeleteMeal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase
        .from('meal')
        .delete()
        .eq('id', id)
      if (error) throw error
      return planId
    },
    onSuccess: (planId) => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan', planId] })
      queryClient.invalidateQueries({ queryKey: ['mealsWithFoods', planId] })
      queryClient.invalidateQueries({ queryKey: ['meals', planId] })
    },
  })
}

export const useCreateMealFood = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (food: Partial<MealFood>) => {
      const { data, error } = await supabase
        .from('meal_food')
        .insert(food)
        .select()
        .single()
      if (error) throw error
      return data as MealFood
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan'] })
      queryClient.invalidateQueries({ queryKey: ['mealsWithFoods'] })
    },
  })
}

export const useUpdateMealFood = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...food }: Partial<MealFood> & { id: string }) => {
      const { data, error } = await supabase
        .from('meal_food')
        .update(food)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as MealFood
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan'] })
      queryClient.invalidateQueries({ queryKey: ['mealsWithFoods'] })
    },
  })
}

export const useDeleteMealFood = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meal_food')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan'] })
      queryClient.invalidateQueries({ queryKey: ['mealsWithFoods'] })
    },
  })
}

export const useCreateFoodAlternative = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alt: { meal_food_id: string; alternative_name: string; quantity: number; unit: string }) => {
      const { data, error } = await supabase
        .from('food_alternative')
        .insert(alt)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan'] })
    },
  })
}

export const useToggleFoodAlternative = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('food_alternative')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlan'] })
    },
  })
}

// ============ LISTA DE COMPRA ============

export const useShoppingLists = (patientId: string) => {
  return useQuery({
    queryKey: ['shoppingLists', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ShoppingList[]
    },
    enabled: !!patientId,
  })
}

export const useShoppingList = (patientId: string) => {
  return useQuery({
    queryKey: ['shoppingList', patientId],
    queryFn: async () => {
      const { data: list, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error || !list) return null
      
      const { data: items, error: itemsError } = await supabase
        .from('shopping_item')
        .select('*')
        .eq('shopping_list_id', list.id)
        .order('category', { ascending: true })
      
      if (itemsError) throw itemsError
      
      return { ...list, items } as ShoppingList & { items: ShoppingItem[] }
    },
    enabled: !!patientId,
  })
}

export const useGenerateShoppingList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ patientId, planId, days }: { patientId: string; planId: string; days: number[] }) => {
      const { data, error } = await supabase.rpc('generate_shopping_list', {
        p_patient_id: patientId,
        p_plan_id: planId,
        p_days: days
      })
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists', variables.patientId] })
    },
  })
}

export const useToggleShoppingItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_purchased }: { id: string; is_purchased: boolean }) => {
      const { data, error } = await supabase
        .from('shopping_item')
        .update({ is_purchased })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] })
    },
  })
}

// ============ REGISTRO DE COMIDAS (PACIENTE) ============

export const useMealLogs = (patientId: string) => {
  return useQuery({
    queryKey: ['mealLogs', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_log')
        .select(`
          *,
          meal:meal(meal_type, name)
        `)
        .eq('patient_id', patientId)
        .order('log_date', { ascending: false })
      if (error) throw error
      return data as MealLog[]
    },
    enabled: !!patientId,
  })
}

export const useCreateMealLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (log: Partial<MealLog>) => {
      const { data, error } = await supabase
        .from('meal_log')
        .upsert(log)
        .select()
        .single()
      if (error) throw error
      return data as MealLog
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', variables.patient_id] })
    },
  })
}

export const useAdherenceRate = (patientId: string, days: number = 7) => {
  return useQuery({
    queryKey: ['adherenceRate', patientId, days],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const { data, error } = await supabase.rpc('calculate_adherence_rate', {
        p_patient_id: patientId,
        p_start_date: startDate,
        p_end_date: endDate
      })
      if (error) throw error
      return data as number
    },
    enabled: !!patientId,
  })
}

// ============ FICHA MÉDICA — ANTECEDENTES ============

export interface MedicalHistory {
  id: string
  patient_id: string
  condition: string
  diagnosed_date?: string
  current: boolean
  notes?: string
  created_at: string
}

export const usePatientMedicalHistory = (patientId: string) => {
  return useQuery({
    queryKey: ['medicalHistory', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as MedicalHistory[]
    },
    enabled: !!patientId,
  })
}

export const useCreateMedicalHistory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: Partial<MedicalHistory>) => {
      const { data, error } = await supabase
        .from('patient_medical_history')
        .insert(record)
        .select()
        .single()
      if (error) throw error
      return data as MedicalHistory
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', variables.patient_id] })
    },
  })
}

export const useDeleteMedicalHistory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from('patient_medical_history')
        .delete()
        .eq('id', id)
      if (error) throw error
      return patientId
    },
    onSuccess: (patientId) => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', patientId] })
    },
  })
}

// ============ FICHA MÉDICA — DOCUMENTOS ============

export interface PatientDocument {
  id: string
  patient_id: string
  file_name: string
  file_path: string
  file_type?: string
  file_size?: number
  notes?: string
  uploaded_at: string
}

export const usePatientDocuments = (patientId: string) => {
  return useQuery({
    queryKey: ['patientDocuments', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_document')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false })
      if (error) throw error
      return data as PatientDocument[]
    },
    enabled: !!patientId,
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ patientId, file, notes }: { patientId: string; file: File; notes?: string }) => {
      const filePath = `${patientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data, error: dbError } = await supabase
        .from('patient_document')
        .insert({
          patient_id: patientId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          notes: notes || null,
        })
        .select()
        .single()
      if (dbError) throw dbError
      return data as PatientDocument
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patientDocuments', data.patient_id] })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, filePath, patientId }: { id: string; filePath: string; patientId: string }) => {
      await supabase.storage.from('patient-files').remove([filePath])
      const { error } = await supabase.from('patient_document').delete().eq('id', id)
      if (error) throw error
      return patientId
    },
    onSuccess: (patientId) => {
      queryClient.invalidateQueries({ queryKey: ['patientDocuments', patientId] })
    },
  })
}

// NOTE: bucket is private — always use getDocumentSignedUrl instead of getPublicUrl
export const useDocumentUrl = async (filePath: string): Promise<string | null> => {
  if (!filePath) return null
  return getDocumentSignedUrl(filePath)
}

export const getDocumentSignedUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('patient-files')
    .createSignedUrl(filePath, 3600)
  if (error) return null
  return data.signedUrl
}

// ============ FICHA CLÍNICA — DECRETO 41/2012 ============

import type { ClinicalRecord, ClinicalRecordType } from '../types'

export const useClinicalRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['clinicalRecords', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_record')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
      if (error) throw error
      return data as ClinicalRecord[]
    },
    enabled: !!patientId,
  })
}

export const useCreateClinicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: Partial<ClinicalRecord>) => {
      const { data, error } = await supabase
        .from('clinical_record')
        .insert(record)
        .select()
        .single()
      if (error) throw error
      return data as ClinicalRecord
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRecords', data.patient_id] })
    },
  })
}

export const useUpdateClinicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...record }: Partial<ClinicalRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('clinical_record')
        .update(record)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ClinicalRecord
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRecords', data.patient_id] })
    },
  })
}