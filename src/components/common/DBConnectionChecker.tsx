import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DBConnectionChecker({ children, fallback }: Props) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('patient').select('id').limit(1)
        if (error) {
          if (error.message.includes('does not exist') || error.code === '404') {
            setIsConnected(false)
            setError('Tables not found. Please run the SQL schema in Supabase.')
          } else {
            setIsConnected(false)
            setError(error.message)
          }
        } else {
          setIsConnected(true)
        }
      } catch (err) {
        setIsConnected(false)
        setError('Failed to connect to database')
      }
    }
    checkConnection()
  }, [])

  if (isConnected === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center bg-white rounded-xl border border-gray-200 p-8">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Base de datos no configurada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Para arreglar esto:</p>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Ve a tu proyecto Supabase</li>
              <li>2. Abre el SQL Editor</li>
              <li>3. Copia y ejecuta el contenido de <code className="bg-gray-200 px-1 rounded">nutriflow_schema_supabase.sql</code></li>
              <li>4. Recarga esta página</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}