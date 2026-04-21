import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Scale,
  Ruler,
  Activity,
  Calendar,
  Utensils,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Pencil,
  FileText,
  Upload,
  Trash2,
  Download,
  HeartPulse,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  usePatient, useMeasurements, useActiveNutritionPlan, useAppointments, useCreateMeasurement,
  usePatientMedicalHistory, useCreateMedicalHistory, useDeleteMedicalHistory,
  usePatientDocuments, useUploadDocument, useDeleteDocument, getDocumentSignedUrl,
  usePatientPreferences, useCreatePatientPreference, useDeletePatientPreference
} from '../hooks/useApi'
import type { PatientObjective, PreferenceType } from '../types'

const getObjectiveLabel = (obj: PatientObjective): string => {
  const labels: Record<PatientObjective, string> = {
    lose_weight: 'Perder peso',
    gain_weight: 'Ganar peso',
    maintain: 'Mantener',
    muscle_gain: 'Ganar músculo',
    medical: 'Médico'
  }
  return labels[obj] || obj
}

const getObjectiveIcon = (obj: PatientObjective) => {
  if (obj === 'lose_weight') return <TrendingDown className="h-5 w-5" />
  if (obj === 'gain_weight' || obj === 'muscle_gain') return <TrendingUp className="h-5 w-5" />
  return <Activity className="h-5 w-5" />
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [measurementError, setMeasurementError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    waist_circumference: '',
    hip_circumference: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  })
  
  // Ficha médica state
  const [fichaOpen, setFichaOpen] = useState(true)
  const [fichaTab, setFichaTab] = useState<'docs' | 'history' | 'prefs'>('docs')
  const [newCondition, setNewCondition] = useState({ condition: '', notes: '', diagnosed_date: '' })
  const [addingCondition, setAddingCondition] = useState(false)
  const [newPreference, setNewPreference] = useState({ preference_type: 'allergy' as PreferenceType, value: '' })
  const [addingPreference, setAddingPreference] = useState(false)
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const { data: patient, isLoading: loadingPatient } = usePatient(patientId || '')
  const { data: measurements = [] } = useMeasurements(patientId || '')
  const { data: activePlan } = useActiveNutritionPlan(patientId || '')
  const { data: appointments = [] } = useAppointments()
  const createMeasurement = useCreateMeasurement()

  // Ficha médica hooks
  const { data: medicalHistory = [] } = usePatientMedicalHistory(patientId || '')
  const { data: documents = [] } = usePatientDocuments(patientId || '')
  const { data: preferences = [] } = usePatientPreferences(patientId || '')
  const createMedicalHistory = useCreateMedicalHistory()
  const deleteMedicalHistory = useDeleteMedicalHistory()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()
  const createPreference = useCreatePatientPreference()
  const deletePreference = useDeletePatientPreference()
  
  const patientAppointments = appointments
    .filter(a => a.patient_id === patientId)
    .filter(a => new Date(a.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3)
  
  const lastMeasurement = measurements[0]
  const firstMeasurement = measurements[measurements.length - 1]
  
  const weightChange = lastMeasurement && firstMeasurement && lastMeasurement.weight && firstMeasurement.weight
    ? lastMeasurement.weight - firstMeasurement.weight 
    : null
    
  const daysSinceLastMeasurement = lastMeasurement 
    ? differenceInDays(new Date(), new Date(lastMeasurement.recorded_at))
    : null

  const saveMeasurement = async () => {
    if (!patientId || !formData.weight) return

    setIsSaving(true)
    setMeasurementError(null)
    try {
      await createMeasurement.mutateAsync({
        patient_id: patientId,
        weight: parseFloat(formData.weight),
        height: formData.height ? parseFloat(formData.height) : undefined,
        waist_circumference: formData.waist_circumference ? parseFloat(formData.waist_circumference) : undefined,
        hip_circumference: formData.hip_circumference ? parseFloat(formData.hip_circumference) : undefined,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : undefined,
        muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : undefined,
        notes: formData.notes || undefined,
      })

      setShowMeasurementModal(false)
      setFormData({ weight: '', height: '', waist_circumference: '', hip_circumference: '', body_fat_percentage: '', muscle_mass: '', notes: '' })
    } catch (error: any) {
      const msg = error?.message || error?.error?.message || JSON.stringify(error)
      setMeasurementError(msg.includes('policy') || msg.includes('RLS') || msg.includes('permission')
        ? 'Sin permisos para guardar. Asegúrate de estar logueado correctamente.'
        : 'Error al guardar: ' + msg)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredMeasurements = measurements
    .filter(m => {
      if (!m.recorded_at) return false
      const date = new Date(m.recorded_at)
      const now = new Date()
      const days = timeRange === '7' ? 7 : timeRange === '30' ? 30 : 90
      return date >= new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    })
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !patientId) return
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 10 MB`)
      e.target.value = ''
      return
    }
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setUploadError('Tipo de archivo no soportado. Usa PDF, Word o imagen.')
      e.target.value = ''
      return
    }
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    try {
      await uploadDocument.mutateAsync({ patientId, file, notes: uploadNotes || undefined })
      setUploadNotes('')
      setUploadSuccess(true)
      e.target.value = ''
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (id: string, filePath: string) => {
    if (!patientId || !window.confirm('¿Eliminar este documento?')) return
    await deleteDocument.mutateAsync({ id, filePath, patientId })
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    const url = await getDocumentSignedUrl(filePath)
    if (!url) return alert('No se pudo obtener el enlace de descarga')
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.target = '_blank'
    a.click()
  }

  const handleAddCondition = async () => {
    if (!newCondition.condition.trim() || !patientId) return
    await createMedicalHistory.mutateAsync({
      patient_id: patientId,
      condition: newCondition.condition.trim(),
      notes: newCondition.notes || undefined,
      diagnosed_date: newCondition.diagnosed_date || undefined,
      current: true,
    })
    setNewCondition({ condition: '', notes: '', diagnosed_date: '' })
    setAddingCondition(false)
  }

  const handleAddPreference = async () => {
    if (!newPreference.value.trim() || !patientId) return
    await createPreference.mutateAsync({
      patient_id: patientId,
      preference_type: newPreference.preference_type,
      value: newPreference.value.trim(),
    })
    setNewPreference({ preference_type: 'allergy', value: '' })
    setAddingPreference(false)
  }

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/patients" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.name} {patient.last_name}
          </h1>
          <p className="text-gray-500">Paciente desde {format(new Date(patient.created_at), 'MMM yyyy', { locale: es })}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/patients/${patientId}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          {activePlan && (
            <Link
              to={`/plans/${patientId}/view`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Utensils className="h-4 w-4" />
              Ver Plan
            </Link>
          )}
          <Link
            to={`/plans/${patientId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Utensils className="h-4 w-4" />
            Editar Plan
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Ruler className="h-4 w-4" />
            <span className="text-sm">Altura</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastMeasurement?.height ? `${lastMeasurement.height} cm` : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Scale className="h-4 w-4" />
            <span className="text-sm">Peso actual</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastMeasurement?.weight ? `${lastMeasurement.weight} kg` : '-'}
          </p>
          {weightChange !== null && (
            <p className={`text-xs mt-1 ${weightChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg total
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm">IMC</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastMeasurement?.imc ? lastMeasurement.imc.toFixed(1) : '-'}
          </p>
          {lastMeasurement?.imc && (
            <p className="text-xs text-gray-500 mt-1">
              {lastMeasurement.imc < 18.5 ? 'Bajo peso' : 
               lastMeasurement.imc < 25 ? 'Normal' : 
               lastMeasurement.imc < 30 ? 'Sobrepeso' : 'Obesidad'}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Ruler className="h-4 w-4" />
            <span className="text-sm">Cintura</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastMeasurement?.waist_circumference ? `${lastMeasurement.waist_circumference} cm` : '-'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Última medición</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastMeasurement ? format(new Date(lastMeasurement.recorded_at), 'dd MMM') : '-'}
          </p>
          {daysSinceLastMeasurement !== null && (
            <p className={`text-xs mt-1 ${daysSinceLastMeasurement > 14 ? 'text-orange-600' : 'text-gray-500'}`}>
              Hace {daysSinceLastMeasurement} días
            </p>
          )}
          <button
            onClick={() => setShowMeasurementModal(true)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="h-3 w-3" />
            Registrar
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {daysSinceLastMeasurement !== null && daysSinceLastMeasurement > 14 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800">Paciente sin mediciones recientes</p>
            <p className="text-sm text-orange-700">
              Han pasado {daysSinceLastMeasurement} días desde la última medición. Considera contactar al paciente.
            </p>
          </div>
        </div>
      )}

      {/* ── SUBIR DOCUMENTO (ZONA PROMINENTE) ── */}
      <div className="bg-white rounded-xl border-2 border-dashed border-rose-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
              <Upload className="h-5 w-5 text-rose-500" />
              Subir documento a la ficha clínica
            </h3>
            <p className="text-sm text-gray-500 mt-1">Exámenes, consentimientos, fichas médicas — PDF, Word o imagen</p>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <label className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
              uploading ? 'bg-gray-100 text-gray-500' : uploadSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}>
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Subiendo...</>
              ) : uploadSuccess ? (
                <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Subido!</>
              ) : (
                <><Upload className="h-4 w-4" />Seleccionar archivo</>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <input
              type="text"
              value={uploadNotes}
              onChange={e => setUploadNotes(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
            />
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        </div>
        {documents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">{documents.length} documento{documents.length !== 1 ? 's' : ''} en la ficha</p>
            <div className="flex flex-wrap gap-2">
              {documents.slice(0, 5).map(doc => {
                const ext = doc.file_name.split('.').pop()?.toLowerCase() || ''
                return (
                  <div key={doc.id} className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs group">
                    <span className={`font-bold ${ext === 'pdf' ? 'text-red-500' : 'text-blue-500'}`}>
                      {ext.toUpperCase()}
                    </span>
                    <span className="text-gray-700 max-w-[120px] truncate">{doc.file_name}</span>
                    <button
                      onClick={() => handleDownload(doc.file_path, doc.file_name)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Descargar"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
              {documents.length > 5 && (
                <span className="text-xs text-gray-400 self-center">+{documents.length - 5} más</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Evolución del peso</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('7')}
                className={`px-3 py-1 text-xs rounded-lg ${timeRange === '7' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
              >
                7 días
              </button>
              <button
                onClick={() => setTimeRange('30')}
                className={`px-3 py-1 text-xs rounded-lg ${timeRange === '30' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
              >
                30 días
              </button>
              <button
                onClick={() => setTimeRange('90')}
                className={`px-3 py-1 text-xs rounded-lg ${timeRange === '90' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
              >
                90 días
              </button>
            </div>
          </div>
          
          {filteredMeasurements.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={filteredMeasurements}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy')}
                  formatter={(value) => [`${value} kg`, 'Peso']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Scale className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay mediciones en este período</p>
                <p className="text-sm">Registra la primera medición del paciente</p>
              </div>
            </div>
          )}
        </div>

        {/* Active Plan Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan nutricional</h2>
          
          {activePlan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Activo
                </span>
                <span className="text-sm text-gray-500">
                  Desde {format(new Date(activePlan.start_date), 'dd MMM')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Calorías</p>
                  <p className="text-lg font-bold text-gray-900">{activePlan.daily_calories}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Proteína</p>
                  <p className="text-lg font-bold text-gray-900">{activePlan.daily_protein}g</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Carbs</p>
                  <p className="text-lg font-bold text-gray-900">{activePlan.daily_carbs}g</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Grasas</p>
                  <p className="text-lg font-bold text-gray-900">{activePlan.daily_fat}g</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Link 
                  to={`/patients/${patientId}/meals`}
                  className="flex-1 text-center text-sm text-emerald-600 hover:text-emerald-700 py-2 px-3 bg-emerald-50 rounded-lg"
                >
                  Seguimiento de comidas →
                </Link>
                <Link 
                  to={`/plans/${patientId}`}
                  className="flex-1 text-center text-sm text-blue-600 hover:text-blue-700 py-2 px-3 bg-blue-50 rounded-lg"
                >
                  Editar plan
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Utensils className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm mb-3">Sin plan nutricional</p>
              <Link
                to={`/plans/${patientId}`}
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Crear plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Next Appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Próximas citas</h2>
          <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700">
            Ver todas →
          </Link>
        </div>
        
        {patientAppointments.length > 0 ? (
          <div className="space-y-3">
            {patientAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.appointment_type === 'first_visit' ? 'Primera visita' :
                       appointment.appointment_type === 'follow_up' ? 'Seguimiento' :
                       appointment.appointment_type === 'evaluation' ? 'Evaluación' : 'Emergencia'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.scheduled_at), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No hay citas programadas</p>
            <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
              Agendar cita
            </Link>
          </div>
        )}
      </div>

      {/* Measurements Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de mediciones</h2>
        
        {measurements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Peso</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">IMC</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Cintura</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">% Grasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...measurements].reverse().slice(0, 10).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">
                      {format(new Date(m.recorded_at), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 text-sm text-gray-900">{m.weight} kg</td>
                    <td className="py-3 text-sm text-gray-900">{m.imc?.toFixed(1) || '-'}</td>
                    <td className="py-3 text-sm text-gray-900">{m.waist_circumference ? `${m.waist_circumference} cm` : '-'}</td>
                    <td className="py-3 text-sm text-gray-900">{m.body_fat_percentage ? `${m.body_fat_percentage}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Scale className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No hay mediciones registradas</p>
            <button
              onClick={() => setShowMeasurementModal(true)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Registrar primera medición
            </button>
          </div>
        )}
      </div>

      {/* ── FICHA MÉDICA ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header colapsable */}
        <button
          onClick={() => setFichaOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-rose-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">Ficha Médica</h2>
              <p className="text-sm text-gray-500">
                {documents.length} documento{documents.length !== 1 ? 's' : ''} •{' '}
                {medicalHistory.length} antecedente{medicalHistory.length !== 1 ? 's' : ''} •{' '}
                {preferences.filter(p => p.preference_type === 'allergy').length} alergia{preferences.filter(p => p.preference_type === 'allergy').length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {fichaOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>

        {fichaOpen && (
          <div className="border-t border-gray-100">
            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'docs' as const,    label: 'Documentos',    count: documents.length,      icon: '📄' },
                { key: 'history' as const, label: 'Antecedentes',  count: medicalHistory.length, icon: '🩺' },
                { key: 'prefs' as const,   label: 'Alergias',      count: preferences.length,    icon: '⚠️' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFichaTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    fichaTab === tab.key
                      ? 'border-rose-500 text-rose-600 bg-rose-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      fichaTab === tab.key ? 'bg-rose-200 text-rose-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab: Documentos ── */}
            {fichaTab === 'docs' && (
            <div className="p-6 space-y-4">
              {/* Upload zone */}
              <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors p-6 ${
                uploading ? 'border-emerald-300 bg-emerald-50' : uploadSuccess ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50'
              }`}>
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                    <p className="text-sm font-medium text-emerald-600">Subiendo documento...</p>
                  </>
                ) : uploadSuccess ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-emerald-600">Documento subido correctamente</p>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                      <Upload className="h-5 w-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Haz clic para subir un documento</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, imagen — máx. 10 MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              <input
                type="text"
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
                placeholder="Descripción del documento (ej: Examen de sangre, Consentimiento...)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
              />

              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              {documents.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  Aún no hay documentos en la ficha médica
                </div>
              ) : (
                <ul className="space-y-2">
                  {documents.map(doc => {
                    const ext = doc.file_name.split('.').pop()?.toLowerCase() || ''
                    const isPdf = ext === 'pdf'
                    const isImg = ['jpg','jpeg','png','gif','webp'].includes(ext)
                    return (
                      <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                            isPdf ? 'bg-red-100 text-red-600' : isImg ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isPdf ? 'PDF' : isImg ? '🖼' : ext.toUpperCase() || '📄'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                              {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ''}
                              {doc.notes ? ` · ${doc.notes}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={() => handleDownload(doc.file_path, doc.file_name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            )}

            {/* ── Tab: Antecedentes médicos ── */}
            {fichaTab === 'history' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Antecedentes médicos</h3>
                </div>
                <button
                  onClick={() => setAddingCondition(v => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </button>
              </div>

              {addingCondition && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newCondition.condition}
                    onChange={e => setNewCondition(c => ({ ...c, condition: e.target.value }))}
                    placeholder="Condición o diagnóstico *"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newCondition.diagnosed_date}
                      onChange={e => setNewCondition(c => ({ ...c, diagnosed_date: e.target.value }))}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newCondition.notes}
                      onChange={e => setNewCondition(c => ({ ...c, notes: e.target.value }))}
                      placeholder="Notas adicionales"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingCondition(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleAddCondition} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Guardar</button>
                  </div>
                </div>
              )}

              {medicalHistory.length === 0 && !addingCondition ? (
                <p className="text-sm text-gray-400 py-2">Sin antecedentes registrados</p>
              ) : (
                <ul className="space-y-2">
                  {medicalHistory.map(item => (
                    <li key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg group">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.condition}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.diagnosed_date ? `Diagnosticado: ${new Date(item.diagnosed_date).toLocaleDateString('es-CL')}` : ''}
                          {item.notes ? (item.diagnosed_date ? ' · ' : '') + item.notes : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMedicalHistory.mutate({ id: item.id, patientId: patientId! })}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}

            {/* ── Tab: Alergias y restricciones ── */}
            {fichaTab === 'prefs' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Alergias y restricciones</h3>
                </div>
                <button
                  onClick={() => setAddingPreference(v => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </button>
              </div>

              {addingPreference && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <select
                      value={newPreference.preference_type}
                      onChange={e => setNewPreference(p => ({ ...p, preference_type: e.target.value as PreferenceType }))}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="allergy">Alergia</option>
                      <option value="diet_restriction">Restricción dietética</option>
                      <option value="rejected_food">Alimento rechazado</option>
                      <option value="favorite_food">Alimento favorito</option>
                    </select>
                    <input
                      type="text"
                      value={newPreference.value}
                      onChange={e => setNewPreference(p => ({ ...p, value: e.target.value }))}
                      placeholder="Ej: Gluten, Lactosa, Mariscos..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingPreference(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleAddPreference} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Guardar</button>
                  </div>
                </div>
              )}

              {preferences.length === 0 && !addingPreference ? (
                <p className="text-sm text-gray-400 py-2">Sin alergias ni restricciones registradas</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {preferences.map(pref => {
                    const colors: Record<string, string> = {
                      allergy: 'bg-red-100 text-red-700 border-red-200',
                      diet_restriction: 'bg-orange-100 text-orange-700 border-orange-200',
                      rejected_food: 'bg-gray-100 text-gray-700 border-gray-200',
                      favorite_food: 'bg-green-100 text-green-700 border-green-200',
                    }
                    const labels: Record<string, string> = {
                      allergy: 'Alergia',
                      diet_restriction: 'Restricción',
                      rejected_food: 'No consume',
                      favorite_food: 'Favorito',
                    }
                    return (
                      <span
                        key={pref.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[pref.preference_type] || colors.allergy}`}
                      >
                        <span className="opacity-60 text-[10px] uppercase tracking-wide">{labels[pref.preference_type]}</span>
                        {pref.value}
                        <button
                          onClick={() => deletePreference.mutate(pref.id)}
                          className="ml-1 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            )}

          </div>
        )}
      </div>

      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Medición</h2>
              <button onClick={() => { setShowMeasurementModal(false); setMeasurementError(null) }} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {measurementError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {measurementError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="70.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="170"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist_circumference}
                    onChange={(e) => setFormData({...formData, waist_circumference: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadera (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hip_circumference}
                    onChange={(e) => setFormData({...formData, hip_circumference: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="95"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Grasa corporal</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa muscular (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muscle_mass}
                    onChange={(e) => setFormData({...formData, muscle_mass: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="35"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Observaciones..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={saveMeasurement}
                disabled={isSaving || !formData.weight}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}