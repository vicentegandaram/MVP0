import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Search, Phone, Mail, Eye, Edit, Trash2,
  MoreVertical, UtensilsCrossed, ShoppingCart, FileText, ChevronRight
} from 'lucide-react'
import { usePatients, useDeletePatient } from '../hooks/useApi'
import { confirm } from '../lib/confirm'
import { format, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'

export function PatientsPage() {
  const { data: patients = [], isLoading } = usePatients()
  const deletePatient = useDeletePatient()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLTableSectionElement>(null)

  const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return '-'
    const birth = new Date(birthDate)
    if (birth > new Date()) return '-'
    return `${differenceInYears(new Date(), birth)} años`
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id: string) => {
    setOpenDropdown(null)
    if (await confirm('¿Eliminar este paciente?', { title: 'Eliminar paciente', confirmText: 'Eliminar', destructive: true })) {
      await deletePatient.mutateAsync(id)
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">{patients.length} pacientes registrados</p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Contacto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Edad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Registrado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" ref={dropdownRef}>
            {filteredPatients.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50">
                {/* Nombre */}
                <td className="px-4 py-4">
                  <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-emerald-700">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {patient.name} {patient.last_name}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* Contacto */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="space-y-1">
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" /> {patient.phone}
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5" /> {patient.email}
                      </div>
                    )}
                  </div>
                </td>

                {/* Edad */}
                <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                  {calculateAge(patient.birth_date)}
                </td>

                {/* Estado */}
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    patient.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {patient.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Registrado */}
                <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                  {format(new Date(patient.created_at), 'dd MMM yyyy', { locale: es })}
                </td>

                {/* Acciones */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* Accesos rápidos visibles siempre */}
                    <Link
                      to={`/plans/${patient.id}`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      title="Plan nutricional"
                    >
                      <UtensilsCrossed className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/plans/${patient.id}/shopping`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Lista de compras"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Link>

                    {/* Dropdown para más opciones */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === patient.id ? null : patient.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Más opciones"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openDropdown === patient.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
                          <Link
                            to={`/patients/${patient.id}`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 text-gray-400" />
                            Ver perfil
                          </Link>
                          <Link
                            to={`/patients/${patient.id}/edit`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 text-gray-400" />
                            Editar datos
                          </Link>

                          <div className="border-t border-gray-100 my-1" />

                          <Link
                            to={`/plans/${patient.id}`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
                            Plan nutricional
                          </Link>
                          <Link
                            to={`/plans/${patient.id}/view`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ChevronRight className="h-4 w-4 text-emerald-500" />
                            Ver plan completo
                          </Link>
                          <Link
                            to={`/plans/${patient.id}/shopping`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                            Lista de compras
                          </Link>
                          <Link
                            to={`/patients/${patient.id}`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="h-4 w-4 text-rose-500" />
                            Ficha médica
                          </Link>

                          <div className="border-t border-gray-100 my-1" />

                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar paciente
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        </div>
        {filteredPatients.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            {searchTerm
              ? <><p className="font-medium">Sin resultados para "{searchTerm}"</p><p className="text-sm mt-1">Intenta con otro nombre o email</p></>
              : <><p className="font-medium">No hay pacientes registrados</p><p className="text-sm mt-1">Agrega tu primer paciente con el botón de arriba</p></>
            }
          </div>
        )}
      </div>
    </div>
  )
}
