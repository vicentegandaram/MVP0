import { useState, useMemo } from 'react'
import { Plus, ChevronLeft, ChevronRight, Clock, X, Calendar, AlertCircle } from 'lucide-react'
import { useAppointments, useCreateAppointment, useUpdateAppointment, usePatients } from '../hooks/useApi'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameDay, isToday, isSameMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '../store'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  scheduled_at: z.string().min(1, 'Selecciona fecha y hora'),
  duration_minutes: z.number().min(15),
  appointment_type: z.enum(['first_visit', 'follow_up', 'evaluation', 'emergency']),
  notes: z.string().optional(),
})

type AppointmentForm = z.infer<typeof appointmentSchema>

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getTypeLabel(type: string) {
  switch (type) {
    case 'first_visit': return 'Primera visita'
    case 'follow_up': return 'Seguimiento'
    case 'evaluation': return 'Evaluación'
    case 'emergency': return 'Emergencia'
    default: return type
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'scheduled': return 'Pendiente'
    case 'confirmed': return 'Confirmada'
    case 'completed': return 'Completada'
    case 'cancelled': return 'Cancelada'
    case 'no_show': return 'No asistió'
    default: return status
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    case 'confirmed': return 'bg-emerald-100 text-emerald-800'
    case 'completed': return 'bg-gray-100 text-gray-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'no_show': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getTypeBg(type: string) {
  switch (type) {
    case 'first_visit': return 'bg-blue-50 border-blue-200'
    case 'follow_up': return 'bg-emerald-50 border-emerald-200'
    case 'evaluation': return 'bg-purple-50 border-purple-200'
    case 'emergency': return 'bg-red-50 border-red-200'
    default: return 'bg-gray-50 border-gray-200'
  }
}

function getTypeDot(type: string) {
  switch (type) {
    case 'first_visit': return 'bg-blue-500'
    case 'follow_up': return 'bg-emerald-500'
    case 'evaluation': return 'bg-purple-500'
    case 'emergency': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export function AppointmentsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: appointments = [] } = useAppointments()
  const { data: patients = [] } = usePatients()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const { nutritionist, user, loadNutritionistProfile } = useAuthStore()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { duration_minutes: 60, appointment_type: 'follow_up' },
  })

  // Resolve nutritionist id — from store or fallback query
  const resolveNutritionistId = async (): Promise<string | null> => {
    if (nutritionist?.id) return nutritionist.id
    // Try to reload profile from Supabase
    await loadNutritionistProfile()
    const refreshed = useAuthStore.getState().nutritionist
    if (refreshed?.id) return refreshed.id
    // Last resort: query directly
    if (!user?.id) return null
    const { data } = await supabase
      .from('nutritionist')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    return data?.id ?? null
  }

  // Build monthly grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days: Date[] = []
    let day = gridStart
    while (day <= gridEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const getAppointmentsForDay = (date: Date) =>
    appointments
      .filter(a => isSameDay(new Date(a.scheduled_at), date))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const selectedDayAppointments = getAppointmentsForDay(selectedDate)
  const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId)

  const openNewAppointment = (date?: Date) => {
    const d = date || selectedDate
    setValue('scheduled_at', format(d, "yyyy-MM-dd'T'09:00"))
    setFormError(null)
    setShowModal(true)
  }

  const onSubmit = async (data: AppointmentForm) => {
    setFormError(null)
    try {
      const nutritionistId = await resolveNutritionistId()
      if (!nutritionistId) {
        setFormError('No se encontró tu perfil de nutricionista. Cierra sesión y vuelve a entrar.')
        return
      }
      await createAppointment.mutateAsync({
        patient_id: data.patient_id,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        appointment_type: data.appointment_type,
        notes: data.notes || undefined,
        nutritionist_id: nutritionistId,
        status: 'scheduled',
      })
      setShowModal(false)
      reset()
    } catch (error: any) {
      const msg = error?.message || error?.error?.message || JSON.stringify(error)
      setFormError('Error al crear la cita: ' + msg)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointment.mutateAsync({ id, status: status as any })
    setSelectedAppointmentId(null)
  }

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Left: Calendar ── */}
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-500 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()) }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-x border-gray-200 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => openNewAppointment()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva cita
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {WEEK_DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayApts = getAppointmentsForDay(day)
              const inMonth = isSameMonth(day, currentMonth)
              const selected = isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={[
                    'min-h-[110px] p-2 border-b border-r border-gray-100 cursor-pointer transition-all',
                    !inMonth && 'bg-gray-50/80',
                    inMonth && !selected && 'hover:bg-emerald-50/40',
                    selected && 'bg-emerald-50 ring-2 ring-inset ring-emerald-500',
                  ].filter(Boolean).join(' ')}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={[
                      'text-sm font-medium h-7 w-7 inline-flex items-center justify-center rounded-full',
                      today ? 'bg-emerald-600 text-white font-bold' : '',
                      !inMonth && !today ? 'text-gray-300' : '',
                      inMonth && !today ? 'text-gray-700' : '',
                    ].filter(Boolean).join(' ')}>
                      {format(day, 'd')}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">{dayApts.length}</span>
                    )}
                  </div>

                  {/* Appointment pills */}
                  <div className="space-y-1">
                    {dayApts.slice(0, 2).map(apt => (
                      <div
                        key={apt.id}
                        onClick={e => { e.stopPropagation(); setSelectedDate(day); setSelectedAppointmentId(apt.id) }}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 border text-[11px] cursor-pointer hover:opacity-80 ${getTypeBg(apt.appointment_type)}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${getTypeDot(apt.appointment_type)}`} />
                        <span className="font-medium text-gray-700">{format(new Date(apt.scheduled_at), 'HH:mm')}</span>
                        <span className="text-gray-600 truncate">{(apt.patient as any)?.name}</span>
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <p className="text-[10px] text-emerald-600 font-medium pl-1">+{dayApts.length - 2} más</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {[
            { label: 'Primera visita', dot: 'bg-blue-500' },
            { label: 'Seguimiento', dot: 'bg-emerald-500' },
            { label: 'Evaluación', dot: 'bg-purple-500' },
            { label: 'Emergencia', dot: 'bg-red-500' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${l.dot}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Day panel ── */}
      <div className="w-72 flex-shrink-0">
        <div className="sticky top-0 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Day header */}
          <div className="bg-emerald-600 px-4 py-4 text-white">
            <p className="text-sm font-medium opacity-75 capitalize">
              {format(selectedDate, 'EEEE', { locale: es })}
            </p>
            <p className="text-2xl font-bold capitalize">
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </p>
            <p className="text-sm opacity-75 mt-0.5">
              {selectedDayAppointments.length === 0
                ? 'Sin citas'
                : `${selectedDayAppointments.length} cita${selectedDayAppointments.length > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="p-4 space-y-3">
            {/* Add appointment button */}
            <button
              onClick={() => openNewAppointment(selectedDate)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar cita
            </button>

            {/* Appointments for the day */}
            {selectedDayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin citas programadas</p>
              </div>
            ) : (
              selectedDayAppointments.map(apt => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointmentId(apt.id)}
                  className="rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-700">
                        {((apt.patient as any)?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {(apt.patient as any)?.name} {(apt.patient as any)?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{getTypeLabel(apt.appointment_type)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(apt.scheduled_at), 'HH:mm')} · {apt.duration_minutes} min
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Nueva cita ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Nueva cita</h2>
                <p className="text-sm text-gray-500 capitalize">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); reset() }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <select
                  {...register('patient_id')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.last_name}</option>
                  ))}
                </select>
                {errors.patient_id && <p className="mt-1 text-xs text-red-600">{errors.patient_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  {...register('scheduled_at')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {errors.scheduled_at && <p className="mt-1 text-xs text-red-600">{errors.scheduled_at.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    {...register('appointment_type')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="first_visit">Primera visita</option>
                    <option value="follow_up">Seguimiento</option>
                    <option value="evaluation">Evaluación</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <select
                    {...register('duration_minutes', { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Observaciones..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); reset() }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {createAppointment.isPending ? 'Creando...' : 'Crear cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Appointment detail ── */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Detalle de cita</h2>
              <button
                onClick={() => setSelectedAppointmentId(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Patient */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-emerald-700">
                    {((selectedAppointment.patient as any)?.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {(selectedAppointment.patient as any)?.name} {(selectedAppointment.patient as any)?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{getTypeLabel(selectedAppointment.appointment_type)}</p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">
                    {format(new Date(selectedAppointment.scheduled_at), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {format(new Date(selectedAppointment.scheduled_at), 'HH:mm')} · {selectedAppointment.duration_minutes} minutos
                </div>
              </div>

              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              {selectedAppointment.notes && (
                <p className="text-sm text-gray-600 italic">"{selectedAppointment.notes}"</p>
              )}

              {/* Status actions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado:</p>
                <div className="flex flex-wrap gap-2">
                  {['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedAppointment.id, status)}
                      disabled={updateAppointment.isPending}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                        selectedAppointment.status === status
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
