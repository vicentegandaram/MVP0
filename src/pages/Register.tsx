import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Loader2 } from 'lucide-react'
import { TERMS_VERSION } from './legal/entity'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, user, nutritionist } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: ''
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (user && nutritionist) {
      navigate('/')
    }
  }, [user, nutritionist, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!acceptedTerms) {
      setValidationError(
        'Debes aceptar los Términos de Servicio y la Política de Privacidad'
      )
      return
    }

    await register(formData.email, formData.password, {
      name: formData.name,
      lastName: formData.lastName,
      licenseNumber: formData.licenseNumber || undefined,
      acceptedTermsVersion: TERMS_VERSION,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">NutriFlow</h1>
          <p className="text-gray-600 mt-2">Crear cuenta de nutricionista</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Registrarse</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de licencia (opcional)</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="Licencia profesional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                required
              />
            </div>

            <label className="flex items-start gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600 leading-snug">
                Acepto los{' '}
                <Link
                  to="/terminos"
                  target="_blank"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link
                  to="/privacidad"
                  target="_blank"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  Política de Privacidad
                </Link>
                . Declaro ser nutricionista habilitado y ser responsable del
                consentimiento de mis pacientes.
              </span>
            </label>

            {(error || validationError) && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error || validationError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}