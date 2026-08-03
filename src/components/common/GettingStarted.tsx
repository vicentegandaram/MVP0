import { Link } from 'react-router-dom'
import { UserPlus, ClipboardList, Send, Check } from 'lucide-react'

interface Props {
  hasPatients: boolean
  hasPlans: boolean
}

/**
 * Guía de primeros pasos del dashboard.
 *
 * Un dashboard vacío no le dice al nutricionista qué hacer, y los primeros
 * minutos son los que deciden si vuelve. Desaparece sola cuando los tres
 * pasos están completos.
 */
export function GettingStarted({ hasPatients, hasPlans }: Props) {
  const steps = [
    {
      done: hasPatients,
      icon: UserPlus,
      title: 'Crea tu primer paciente',
      description: 'Con el nombre y la edad basta para empezar.',
      to: '/patients/new',
      cta: 'Crear paciente',
    },
    {
      done: hasPlans,
      icon: ClipboardList,
      title: 'Genera un plan de alimentación',
      description:
        'Elige un objetivo y el sistema arma la semana completa. Después lo editas.',
      to: '/patients',
      cta: 'Ir a pacientes',
    },
    {
      done: false,
      icon: Send,
      title: 'Compártelo con tu paciente',
      description:
        'Desde el plan puedes imprimirlo o enviar un enlace privado donde marca sus comidas.',
      to: '/plans',
      cta: 'Ver planes',
    },
  ]

  // Los dos primeros pasos son los medibles; el tercero es informativo.
  if (hasPatients && hasPlans) return null

  const nextStep = steps.findIndex((s) => !s.done)

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold text-emerald-900">
        Primeros pasos
      </h2>
      <p className="text-sm text-emerald-800/80 mt-0.5 mb-4">
        Tres pasos para tener tu consulta funcionando.
      </p>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isNext = index === nextStep

          return (
            <li
              key={step.title}
              className={`flex items-start gap-3 rounded-lg border bg-white p-4 ${
                isNext ? 'border-emerald-300' : 'border-gray-200'
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  step.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {step.done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${
                    step.done ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>

              {!step.done && (
                <Link
                  to={step.to}
                  className={`shrink-0 self-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isNext
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {step.cta}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
