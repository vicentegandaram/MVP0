import * as Sentry from '@sentry/react'
import { logger } from './logger'

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined

/**
 * Monitoreo de errores en producción.
 *
 * Sin `VITE_SENTRY_DSN` definido todo esto es inerte: no se carga Sentry, no
 * se hacen requests y `captureException` solo escribe en la consola de dev.
 * Así el proyecto sigue funcionando en local sin cuenta de Sentry.
 */
export function initMonitoring() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sin session replay ni performance: son los que consumen la cuota
    // gratuita. Activar solo si hacen falta.
    tracesSampleRate: 0,
    // Datos clínicos: nunca enviar el cuerpo de las peticiones ni los
    // valores de los formularios en los breadcrumbs.
    sendDefaultPii: false,
    beforeBreadcrumb: (breadcrumb) => {
      if (breadcrumb.category === 'console') return null
      return breadcrumb
    },
  })
}

/** Identifica al usuario en Sentry. Solo el id: nunca email ni nombre. */
export function setMonitoringUser(userId: string | null) {
  if (!dsn) return
  Sentry.setUser(userId ? { id: userId } : null)
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  logger.error(error)
  if (!dsn) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
