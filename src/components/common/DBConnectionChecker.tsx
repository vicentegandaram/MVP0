import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { captureException } from '../../lib/monitoring'
import { logger } from '../../lib/logger'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type Status = 'checking' | 'ok' | 'unreachable' | 'not-configured'

const TIMEOUT_MS = 10_000

export function DBConnectionChecker({ children, fallback }: Props) {
  const [status, setStatus] = useState<Status>('checking')
  const [detail, setDetail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const checkConnection = async () => {
      // Sin esta carrera, una caída de red deja la promesa colgada y el
      // usuario se queda mirando el spinner indefinidamente.
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      )

      try {
        const { error } = await Promise.race([
          supabase.from('patient').select('id').limit(1),
          timeout,
        ])

        if (cancelled) return

        if (!error) {
          setStatus('ok')
          return
        }

        // Tablas ausentes = proyecto de Supabase sin migrar. Es un problema
        // de instalación, no una caída.
        if (error.message.includes('does not exist') || error.code === '42P01') {
          setStatus('not-configured')
          setDetail(error.message)
          logger.error('Schema no aplicado en Supabase:', error.message)
          return
        }

        setStatus('unreachable')
        setDetail(error.message)
        captureException(new Error(`DB check falló: ${error.message}`))
      } catch (err) {
        if (cancelled) return
        setStatus('unreachable')
        setDetail(err instanceof Error ? err.message : 'Error desconocido')
        captureException(err)
      }
    }

    checkConnection()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando...</p>
        </div>
      </div>
    )
  }

  if (status === 'ok') return <>{children}</>

  if (fallback) return <>{fallback}</>

  // Instalación incompleta: mensaje técnico, solo tiene sentido en dev.
  if (status === 'not-configured') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center bg-white rounded-xl border border-gray-200 p-8">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Base de datos no configurada
          </h1>
          <p className="text-gray-600 mb-6">{detail}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Para arreglar esto:</p>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Ve a tu proyecto Supabase</li>
              <li>2. Abre el SQL Editor</li>
              <li>
                3. Ejecuta{' '}
                <code className="bg-gray-200 px-1 rounded">
                  nutriflow_schema_supabase.sql
                </code>
              </li>
              <li>4. Recarga esta página</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // Caída o problema de red: esto sí lo puede ver un cliente que paga, así
  // que nada de jerga ni de instrucciones internas.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md text-center bg-white rounded-xl border border-gray-200 p-8">
        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          No pudimos conectar
        </h1>
        <p className="text-gray-600 mb-6">
          El servicio no está respondiendo en este momento. Tus datos están a
          salvo. Revisa tu conexión e inténtalo de nuevo en unos minutos.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
        {import.meta.env.DEV && detail && (
          <p className="mt-4 text-xs text-gray-400 break-words">{detail}</p>
        )}
      </div>
    </div>
  )
}
