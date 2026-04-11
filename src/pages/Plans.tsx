import { usePatients } from '../hooks/useApi'
import { UtensilsCrossed, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PlansPage() {
  const { data: patients = [], isLoading } = usePatients()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planes Nutricionales</h1>
        <p className="text-gray-500">Gestiona los planes de tus pacientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            to={`/plans/${patient.id}`}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-sm font-medium text-emerald-700">
                  {patient.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{patient.name} {patient.last_name}</p>
                <p className="text-sm text-gray-500">Sin plan activo</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay pacientes registrados</p>
          <Link to="/patients/new" className="text-emerald-600 hover:text-emerald-700 text-sm">
            Crear paciente
          </Link>
        </div>
      )}
    </div>
  )
}