import { Users, Calendar, TrendingUp, Clock, AlertTriangle, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePatients, useAppointments } from '../hooks/useApi'
import { supabase } from '../lib/supabase'
import { format, isToday, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from 'react'

interface PatientAtRisk {
  id: string
  name: string
  last_name: string
  reason: string
  severity: 'high' | 'medium'
  daysSinceLastMeasurement?: number
}

const statsCards = [
  { label: 'Pacientes activos', icon: Users, key: 'patients', color: 'bg-blue-500' },
  { label: 'Citas hoy', icon: Calendar, key: 'todayAppointments', color: 'bg-emerald-500' },
  { label: 'Esta semana', icon: Clock, key: 'weekAppointments', color: 'bg-purple-500' },
  { label: 'Pendientes', icon: TrendingUp, key: 'pending', color: 'bg-orange-500' },
]

export function DashboardPage() {
  const { data: patients = [] } = usePatients()
  const { data: appointments = [] } = useAppointments()
  const [patientsAtRisk, setPatientsAtRisk] = useState<PatientAtRisk[]>([])

  useEffect(() => {
    const checkPatientsAtRisk = async () => {
      try {
        if (patients.length === 0) return

        const patientIds = patients.map(p => p.id)
        const { data: allMeasurements } = await supabase
          .from('measurement')
          .select('patient_id, recorded_at')
          .in('patient_id', patientIds)
          .order('recorded_at', { ascending: false })

        const latestByPatient: Record<string, string> = {}
        for (const m of allMeasurements || []) {
          if (!latestByPatient[m.patient_id]) latestByPatient[m.patient_id] = m.recorded_at
        }

        const atRisk: PatientAtRisk[] = []
        for (const patient of patients) {
          const lastRecorded = latestByPatient[patient.id]
          const daysSinceLastMeasurement = lastRecorded
            ? differenceInDays(new Date(), new Date(lastRecorded))
            : null

          const lastAppointment = appointments
            .filter(a => a.patient_id === patient.id && new Date(a.scheduled_at) < new Date())
            .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]
          const daysSinceLastAppointment = lastAppointment
            ? differenceInDays(new Date(), new Date(lastAppointment.scheduled_at))
            : null

          if (daysSinceLastMeasurement !== null && daysSinceLastMeasurement > 21) {
            atRisk.push({
              id: patient.id, name: patient.name, last_name: patient.last_name || '',
              reason: `Sin mediciones desde hace ${daysSinceLastMeasurement} días`,
              severity: daysSinceLastMeasurement > 30 ? 'high' : 'medium',
              daysSinceLastMeasurement
            })
          } else if (daysSinceLastAppointment !== null && daysSinceLastAppointment > 35) {
            atRisk.push({
              id: patient.id, name: patient.name, last_name: patient.last_name || '',
              reason: `Última cita hace ${daysSinceLastAppointment} días`,
              severity: 'high'
            })
          }
        }

        setPatientsAtRisk(atRisk.sort((a, b) => {
          if (a.severity === 'high' && b.severity !== 'high') return -1
          if (b.severity === 'high' && a.severity !== 'high') return 1
          return 0
        }))
      } catch (err) {
        console.error('Error checking patients at risk:', err)
      }
    }

    if (patients.length > 0) checkPatientsAtRisk()
  }, [patients, appointments])

  const todayAppointments = appointments.filter(a => isToday(new Date(a.scheduled_at)))
  const weekAppointments = appointments.filter(a => {
    const date = new Date(a.scheduled_at)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return date >= now && date <= weekFromNow
  })
  const pendingAppointments = appointments.filter(a => a.status === 'scheduled')

  const stats = [
    { value: patients.length, label: 'Pacientes activos' },
    { value: todayAppointments.length, label: 'Citas hoy' },
    { value: weekAppointments.length, label: 'Esta semana' },
    { value: pendingAppointments.length, label: 'Pendientes' },
  ]

  const upcomingAppointments = appointments
    .filter(a => new Date(a.scheduled_at) >= new Date() && a.status === 'scheduled')
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen de tu consulta nutricional</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statsCards[index].icon
          return (
            <div
              key={statsCards[index].key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${statsCards[index].color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pacientes en Riesgo */}
      {patientsAtRisk.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 shadow-sm overflow-hidden">
          <div className="border-b border-orange-200 px-5 py-4 bg-orange-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-900">Pacientes que requieren atención</h2>
          </div>
          <div className="divide-y divide-orange-100">
            {patientsAtRisk.slice(0, 5).map((patient) => (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-orange-100/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    patient.severity === 'high' ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      patient.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient.name} {patient.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {patient.reason}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  patient.severity === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {patient.severity === 'high' ? 'Urgente' : 'Atención'}
                </span>
              </Link>
            ))}
          </div>
          {patientsAtRisk.length > 5 && (
            <div className="px-5 py-3 bg-orange-100/50 text-center">
              <Link to="/patients" className="text-sm text-orange-700 hover:text-orange-800 font-medium">
                Ver los {patientsAtRisk.length} pacientes en riesgo →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Upcoming appointments */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500">
              No hay citas programadas
            </div>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">
                      {(appointment.patient as any)?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {(appointment.patient as any)?.name} {(appointment.patient as any)?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.appointment_type === 'first_visit' ? 'Primera visita' : 
                       appointment.appointment_type === 'follow_up' ? 'Seguimiento' :
                       appointment.appointment_type === 'evaluation' ? 'Evaluación' : 'Emergencia'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(appointment.scheduled_at), 'HH:mm', { locale: es })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(appointment.scheduled_at), 'dd MMM', { locale: es })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/patients/new"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <Users className="h-5 w-5" />
          <span className="font-medium">Nuevo paciente</span>
        </Link>
        <Link
          to="/appointments"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <Calendar className="h-5 w-5" />
          <span className="font-medium">Nueva cita</span>
        </Link>
        <Link
          to="/patients"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="font-medium">Ver pacientes</span>
        </Link>
      </div>
    </div>
  )
}