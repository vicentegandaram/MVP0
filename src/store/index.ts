import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
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
  register: (email: string, password: string, profile: { name: string; lastName: string; email: string; licenseNumber?: string }) => Promise<void>
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
            password
          })
          
          if (error) throw error
          
          set({ 
            user: data.user, 
            isLoading: false 
          })
          
          await get().loadNutritionistProfile()
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Error al iniciar sesión' 
          })
        }
      },

      register: async (email: string, password: string, profile: { name: string; lastName: string; email: string; licenseNumber?: string }) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: profile.name,
                last_name: profile.lastName
              }
            }
          })
          
          if (error) throw error
          
          if (data.user) {
            await supabase
              .from('nutritionist')
              .insert({
                user_id: data.user.id,
                name: profile.name,
                last_name: profile.lastName,
                email: profile.email,
                license_number: profile.licenseNumber
              })
            
            set({ 
              user: data.user, 
              isLoading: false 
            })
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Error al crear cuenta' 
          })
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
          console.error('Auth check error:', error)
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