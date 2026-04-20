export type Gender = 'male' | 'female' | 'other'
export type PatientObjective = 'lose_weight' | 'gain_weight' | 'maintain' | 'muscle_gain' | 'medical'
export type AppointmentType = 'first_visit' | 'follow_up' | 'evaluation' | 'emergency'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type MealType = 'breakfast' | 'mid_morning' | 'lunch' | 'afternoon' | 'dinner' | 'snack'
export type PreferenceType = 'diet_restriction' | 'allergy' | 'rejected_food' | 'favorite_food'
export type PreferenceSeverity = 'low' | 'medium' | 'high'
export type LogStatus = 'completed' | 'partial' | 'missed' | 'skipped'
export type FoodUnit = 'g' | 'ml' | 'piece' | 'cup' | 'tbsp'
export type ShoppingCategory = 'protein' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'fats' | 'other'

export interface Nutritionist {
  id: string
  user_id: string
  name: string
  last_name?: string
  email: string
  phone?: string
  license_number?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  nutritionist_id: string
  name: string
  last_name?: string
  email?: string
  phone?: string
  birth_date?: string
  gender?: Gender
  // Campos Decreto 41/2012
  run?: string
  address?: string
  commune?: string
  region?: string
  nationality?: string
  consent_signed?: boolean
  consent_date?: string
  // Contacto de emergencia
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ClinicalRecordType =
  | 'anamnesis'
  | 'consultation'
  | 'follow_up'
  | 'evaluation'
  | 'consent'
  | 'discharge'

export interface ClinicalRecord {
  id: string
  patient_id: string
  nutritionist_id: string
  record_type: ClinicalRecordType
  // Anamnesis
  reason_for_consultation?: string
  current_illness?: string
  medical_background?: string
  family_background?: string
  dietary_habits?: string
  physical_activity?: string
  // Diagnóstico
  nutritional_diagnosis?: string
  treatment_plan?: string
  // Signos vitales
  systolic_bp?: number
  diastolic_bp?: number
  // Consentimiento
  consent_text?: string
  consent_signed?: boolean
  patient_signature_url?: string
  // General
  notes?: string
  // Metadatos
  recorded_at: string
  created_at: string
}

export interface PatientGoal {
  id: string
  patient_id: string
  objective: PatientObjective
  target_weight?: number
  current_weight?: number
  start_date: string
  target_date?: string
  notes?: string
  is_active: boolean
  created_at: string
}

export interface PatientPreference {
  id: string
  patient_id: string
  preference_type: PreferenceType
  value: string
  severity?: PreferenceSeverity
  created_at: string
}

export interface Measurement {
  id: string
  patient_id: string
  recorded_at: string
  weight?: number
  height?: number
  imc?: number
  waist_circumference?: number
  hip_circumference?: number
  body_fat_percentage?: number
  muscle_mass?: number
  notes?: string
  created_at: string
}

export interface Appointment {
  id: string
  nutritionist_id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  appointment_type: AppointmentType
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface NutritionPlan {
  id: string
  patient_id: string
  name: string
  start_date: string
  end_date?: string
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  observations?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  plan_id: string
  day_of_week: number
  meal_type: MealType
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  notes?: string
  created_at: string
  foods?: MealFood[]
}

export interface MealFood {
  id: string
  meal_id: string
  food_name: string
  quantity: number
  unit: FoodUnit
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  category?: ShoppingCategory
  alternatives?: FoodAlternative[]
}

export interface FoodAlternative {
  id: string
  meal_food_id: string
  alternative_name: string
  quantity: number
  unit: FoodUnit
  is_active: boolean
}

export interface ShoppingList {
  id: string
  patient_id: string
  week_start_date: string
  name: string
  status: string
  created_at: string
  items?: ShoppingItem[]
}

export interface ShoppingItem {
  id: string
  shopping_list_id: string
  food_name: string
  quantity: number
  unit: FoodUnit
  category: ShoppingCategory
  is_purchased: boolean
}

export interface MealLog {
  id: string
  patient_id: string
  meal_id: string
  log_date: string
  status: LogStatus
  consumed_alternative_id?: string
  actual_notes?: string
  photo_url?: string
  satiety_level?: number
  energy_level?: number
  logged_at: string
  meal?: Meal
}

export interface PatientOverview {
  latest_measurement?: {
    weight: number
    imc: number
    waist_circumference: number
    recorded_at: string
  }
  active_goal?: {
    objective: PatientObjective
    target_weight: number
    current_weight: number
    target_date: string
  }
  upcoming_appointment?: {
    scheduled_at: string
    appointment_type: AppointmentType
    status: AppointmentStatus
  }
  active_plan?: {
    name: string
    start_date: string
    daily_calories: number
    daily_protein: number
    daily_carbs: number
    daily_fat: number
  }
  adherence_rate_7_days: number
  adherence_rate_30_days: number
}

export interface ChartDataPoint {
  recorded_at: string
  weight: number
  imc: number
  waist_circumference?: number
  body_fat_percentage?: number
}