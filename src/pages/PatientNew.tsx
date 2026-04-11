import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useCreatePatient, useUpdatePatient, usePatient } from '../hooks/useApi'
import { useAuthStore } from '../store'
import { useEffect, useState } from 'react'

const patientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>

export function PatientNewPage() {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()
  const isEditing = !!patientId

  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const nutritionistId = useAuthStore((state) => state.nutritionist?.id)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { data: existingPatient, isLoading: loadingPatient } = usePatient(patientId || '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  })

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingPatient) {
      reset({
        name: existingPatient.name,
        last_name: existingPatient.last_name || '',
        email: existingPatient.email || '',
        phone: existingPatient.phone || '',
        birth_date: existingPatient.birth_date || '',
        gender: (existingPatient.gender as any) || '',
        emergency_contact_name: existingPatient.emergency_contact_name || '',
        emergency_contact_phone: existingPatient.emergency_contact_phone || '',
      })
    }
  }, [existingPatient, isEditing, reset])

  const onSubmit = async (data: PatientForm) => {
    setSaveError(null)

    // Clean up empty strings
    const cleanData = {
      ...data,
      last_name: data.last_name || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      birth_date: data.birth_date || undefined,
      gender: (data.gender || undefined) as any,
      emergency_contact_name: data.emergency_contact_name || undefined,
      emergency_contact_phone: data.emergency_contact_phone || undefined,
    }

    try {
      if (isEditing && patientId) {
        await updatePatient.mutateAsync({ id: patientId, ...cleanData })
        navigate(`/patients/${patientId}`)
      } else {
        if (!nutritionistId) {
          setSaveError('No hay sesión activa. Recarga la página e intenta de nuevo.')
          return
        }
        await createPatient.mutateAsync({ ...cleanData, nutritionist_id: nutritionistId, is_active: true })
        navigate('/patients')
      }
    } catch (error: any) {
      setSaveError(error?.message || 'Error al guardar el paciente')
    }
  }

  const isPending = createPatient.isPending || updatePatient.isPending

  if (isEditing && loadingPatient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(isEditing ? `/patients/${patientId}` : '/patients')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEditing ? 'Volver al paciente' : 'Volver a pacientes'}
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Editar paciente' : 'Nuevo paciente'}
        </h1>

        {saveError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos personales */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos personales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  {...register('last_name')}
                  type="text"
                  placeholder="García"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                <input
                  {...register('birth_date')}
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <select
                  {...register('gender')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="paciente@email.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto de emergencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  {...register('emergency_contact_name')}
                  type="text"
                  placeholder="María García"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  {...register('emergency_contact_phone')}
                  type="tel"
                  placeholder="+56 9 8765 4321"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/patients/${patientId}` : '/patients')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
