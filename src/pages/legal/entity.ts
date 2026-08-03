/**
 * Datos del titular del servicio, usados por los documentos legales.
 *
 * ⚠️ ANTES DE COBRARLE A UN CLIENTE hay que reemplazar los valores marcados
 * como PENDIENTE. Publicar una política de privacidad con placeholders es
 * peor que no tenerla: deja constancia de que nadie la revisó.
 *
 * Si aún no hay sociedad constituida, se puede operar como persona natural
 * (nombre completo + RUT + domicilio). Es válido y es lo habitual al partir.
 */
export const LEGAL_ENTITY = {
  /** Razón social o nombre completo si operas como persona natural. */
  legalName: '[PENDIENTE: razón social o nombre completo]',
  /** Nombre de fantasía que ven los usuarios. */
  tradeName: 'NutriFlow',
  rut: '[PENDIENTE: RUT]',
  address: '[PENDIENTE: domicilio, comuna, Chile]',
  /** Casilla para ejercer derechos sobre datos personales. */
  privacyEmail: '[PENDIENTE: correo de contacto]',
  supportEmail: '[PENDIENTE: correo de soporte]',
  /** Región donde Supabase aloja el proyecto (Dashboard → Settings → General). */
  dataRegion: '[PENDIENTE: región de Supabase]',
} as const

/** Fecha de la última revisión de los documentos legales. */
export const LEGAL_UPDATED_AT = '3 de agosto de 2026'

/**
 * Versión de los términos que el usuario acepta al registrarse. Súbela cuando
 * cambie algo sustantivo: permite saber qué versión aceptó cada cuenta y
 * pedir una nueva aceptación si hace falta.
 */
export const TERMS_VERSION = '1.0'
