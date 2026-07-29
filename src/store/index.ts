import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import type { Nutritionist, Patient } from '../types'

// UI Store
interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

// Patient Store
interface PatientState {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
}

export const usePatientStore = create<PatientState>()((set) => ({
  selectedPatient: null,
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))

// Auth Store
interface AuthState {
  user: User | null
  nutritionist: Nutritionist | null
  isLoading: boolean
  error: string | null
  
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, profile: { name: string; lastName: string; licenseNumber?: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loadNutritionistProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      nutritionist: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          set({ user: data.user, isLoading: false })
          await get().loadNutritionistProfile()
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
          set({ isLoading: false, error: message })
        }
      },

      register: async (email: string, password: string, profile: { name: string; lastName: string; licenseNumber?: string }) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: profile.name,
                last_name: profile.lastName,
                license_number: profile.licenseNumber || null,
              },
            },
          })

          if (error) throw error

          // El trigger `on_auth_user_created_create_nutritionist` crea la fila
          // en `nutritionist` automáticamente con los metadatos de arriba.
          if (data.user) {
            set({ user: data.user })
            // Si Supabase auto-confirma el email, ya hay sesión y podemos cargar el perfil.
            // Si requiere confirmación, no hay sesión todavía: el perfil se cargará en checkAuth().
            if (data.session) {
              await get().loadNutritionistProfile()
            }
          }

          set({ isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al crear cuenta'
          set({ isLoading: false, error: message })
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, nutritionist: null })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            set({ user: session.user })
            await get().loadNutritionistProfile()
          }
        } catch (error) {
          logger.error('Auth check error:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      loadNutritionistProfile: async () => {
        const { user } = get()
        if (!user) return

        const { data } = await supabase
          .from('nutritionist')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data) {
          set({ nutritionist: data })
        }
      }
    }),
    {
      name: 'nutriflow-auth',
      partialize: (state) => ({ user: state.user, nutritionist: state.nutritionist }),
    }
  )
)