import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { captureException } from '../../lib/monitoring'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Última red de seguridad de la app.
 *
 * Sin esto, cualquier excepción durante el render deja `#root` vacío y el
 * usuario ve una pantalla en blanco, sin pista de qué pasó ni cómo salir.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, { componentStack: info.componentStack })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-600 mb-6">
            Se produjo un error inesperado. Tus datos están a salvo. Si el
            problema persiste, escríbenos y lo revisamos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
            >
              Volver al inicio
            </a>
          </div>

          {import.meta.env.DEV && (
            <pre className="mt-6 p-3 bg-gray-900 text-gray-100 text-xs text-left rounded-lg overflow-x-auto">
              {error.stack ?? error.message}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
