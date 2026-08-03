import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  updatedAt: string
  children: React.ReactNode
}

export function LegalLayout({ title, updatedAt, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-emerald-600">
            NutriFlow
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: {updatedAt}
        </p>

        <div
          className="
            space-y-6 text-gray-700 leading-relaxed
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5
            [&_a]:text-emerald-600 [&_a]:underline
            [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
            [&_th]:text-left [&_th]:font-semibold [&_th]:p-2 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-100
            [&_td]:p-2 [&_td]:border [&_td]:border-gray-200 [&_td]:align-top
          "
        >
          {children}
        </div>

        <footer className="mt-16 pt-6 border-t border-gray-200 flex gap-6 text-sm">
          <Link to="/terminos" className="text-gray-600 hover:text-gray-900">
            Términos de Servicio
          </Link>
          <Link to="/privacidad" className="text-gray-600 hover:text-gray-900">
            Política de Privacidad
          </Link>
        </footer>
      </main>
    </div>
  )
}
