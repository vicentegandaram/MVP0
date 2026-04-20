import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ShoppingCart, Users, Calendar, FileText, ChevronRight,
  Check, Zap, Clock, Shield, Star, Menu, X, ArrowRight,
  UtensilsCrossed, TrendingUp, BarChart2, Wand2
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
]

const FEATURES = [
  {
    icon: Wand2,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Plan completo en 3 clics',
    desc: 'Selecciona el objetivo del paciente y NutriFlow genera 35 comidas distribuidas en 7 días — desayuno, colación, almuerzo, once y cena. Lo que antes tomaba 45 minutos, ahora toma segundos.',
  },
  {
    icon: ShoppingCart,
    color: 'bg-blue-100 text-blue-600',
    title: 'Lista de compras automática',
    desc: 'Cada plan genera automáticamente una lista de supermercado categorizada por tipo de alimento. El paciente llega al supermercado sabiendo exactamente qué comprar y en qué cantidades.',
  },
  {
    icon: Users,
    color: 'bg-violet-100 text-violet-600',
    title: 'Gestión de pacientes',
    desc: 'Ficha completa con datos personales, antecedentes médicos, alergias, restricciones alimentarias y documentos adjuntos. Todo el historial clínico en un solo lugar.',
  },
  {
    icon: UtensilsCrossed,
    color: 'bg-orange-100 text-orange-600',
    title: 'Edición inline del plan',
    desc: '¿Necesitas ajustar una comida? Edita cantidades, reemplaza alimentos o agrega nuevas comidas directamente desde la vista del plan, sin formularios extra.',
  },
  {
    icon: Calendar,
    color: 'bg-rose-100 text-rose-600',
    title: 'Agenda integrada',
    desc: 'Programa citas, lleva seguimiento del estado y recibe alertas de pacientes que llevan semanas sin medición o sin cita. Sin saltar entre apps.',
  },
  {
    icon: FileText,
    color: 'bg-amber-100 text-amber-600',
    title: 'Ficha médica digital',
    desc: 'Sube exámenes, resultados y documentos PDF directamente al perfil del paciente. Accede a toda la información clínica desde cualquier dispositivo.',
  },
]

const STEPS = [
  { n: '01', title: 'Crea al paciente', desc: 'Nombre, datos de contacto, objetivo y antecedentes en menos de 2 minutos.' },
  { n: '02', title: 'Elige el objetivo', desc: 'Pérdida de peso, ganancia muscular, mantenimiento o seguimiento médico.' },
  { n: '03', title: 'Genera el plan', desc: 'NutriFlow crea 35 comidas completas para toda la semana en segundos.' },
  { n: '04', title: 'Comparte con el paciente', desc: 'La lista de compras queda lista al instante. El paciente llega preparado.' },
]

const TESTIMONIALS = [
  {
    name: 'Camila R.',
    role: 'Nutricionista clínica, Santiago',
    text: 'Antes pasaba casi una hora armando cada plan en Word. Ahora lo genero en segundos y lo ajusto en la misma pantalla. Mis pacientes reciben algo mucho más profesional.',
    stars: 5,
  },
  {
    name: 'Sebastián M.',
    role: 'Nutricionista deportivo, Concepción',
    text: 'La lista de compras automática es lo que más valoran mis pacientes. Ya no tengo que explicarles qué comprar — lo tienen todo categorizado.',
    stars: 5,
  },
  {
    name: 'Valentina C.',
    role: 'Nutricionista independiente, Valparaíso',
    text: 'Tenía todo en hojas de cálculo. Migré en una tarde y ahora toda la ficha clínica de mis pacientes está en un solo lugar. No volvería atrás.',
    stars: 5,
  },
]

const FAQS = [
  {
    q: '¿Necesito instalar algo?',
    a: 'No. NutriFlow funciona completamente en el navegador web. Solo necesitas una cuenta y conexión a internet desde cualquier dispositivo.',
  },
  {
    q: '¿Los planes nutricionales son genéricos?',
    a: 'Los planes se generan según el objetivo del paciente y se pueden editar comida por comida, alimento por alimento. Son un punto de partida profesional, no una plantilla fija.',
  },
  {
    q: '¿Mis datos y los de mis pacientes están seguros?',
    a: 'Sí. Usamos Supabase con servidores en la región de Sudamérica, cifrado en tránsito y en reposo, y políticas de acceso estrictas. Tus datos son solo tuyos.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin períodos de permanencia ni penalizaciones. Si cancelas, sigues teniendo acceso hasta el final del período pagado.',
  },
  {
    q: '¿Funciona para nutricionistas con muchos pacientes?',
    a: 'El plan Profesional no tiene límite de pacientes activos. Está pensado para nutricionistas que atienden entre 20 y 150 pacientes mensuales.',
  },
]

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">NutriFlow</span>
            </div>

            {/* Nav links desktop */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  {l.label}
                </a>
              ))}
            </nav>

            {/* CTAs desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Probar gratis
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-gray-700 hover:text-emerald-600 py-1"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 text-center py-2">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-emerald-700"
              >
                Probar gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-20 pb-24 px-4 sm:px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-sm text-emerald-700 shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            Diseñado para nutricionistas en Chile
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Tu plan semanal listo
            <br />
            <span className="text-emerald-600">en 2 minutos, no en 2 horas</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            NutriFlow genera planes nutricionales completos con comidas, lista de compras y ficha clínica.
            Lo que antes hacías en Excel, ahora lo automatizas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Empezar gratis — sin tarjeta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Social proof micro */}
          <p className="mt-8 text-sm text-gray-500">
            Usado por nutricionistas en Santiago, Concepción y Valparaíso
          </p>
        </div>

        {/* App preview */}
        <div className="mx-auto mt-16 max-w-5xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/60 overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400">
                app.nutriflow.cl
              </div>
            </div>
            {/* App mockup content */}
            <div className="bg-gray-50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active plan card mockup */}
                <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">Plan Activo</span>
                    <span className="text-xs text-gray-500">Desde 13 abr 2026</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4">Plan de Ganancia de músculo</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[['2600','kcal'],['170g','Proteína'],['300g','Carbs'],['65g','Grasas']].map(([v,l]) => (
                      <div key={l} className="rounded-lg bg-white p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-900">{v}</p>
                        <p className="text-xs text-gray-500">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 flex items-center gap-1">
                      <UtensilsCrossed className="h-3 w-3" /> Ver plan completo
                    </div>
                    <div className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" /> Lista de compras
                    </div>
                  </div>
                </div>
                {/* Stats sidebar mockup */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 mb-1">Pacientes activos</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 mb-1">Citas esta semana</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 mb-1">Planes generados</p>
                    <p className="text-2xl font-bold text-emerald-600">24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problema / Solución ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              El problema que conoces de memoria
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              El 70% de los nutricionistas en Chile trabaja con Excel, Word y papel. No porque les guste — sino porque no había nada mejor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sin NutriFlow */}
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                <X className="h-5 w-5" /> Sin NutriFlow
              </h3>
              <ul className="space-y-3">
                {[
                  '45 minutos armando el plan en Word para cada paciente',
                  'Lista de compras calculada a mano o en Excel',
                  'Ficha clínica en papel o esparcida en carpetas',
                  'Agenda en el celular, datos en el computador, documentos en Drive',
                  'Cada nuevo paciente empieza desde cero',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-red-700">
                    <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Con NutriFlow */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <Check className="h-5 w-5" /> Con NutriFlow
              </h3>
              <ul className="space-y-3">
                {[
                  'Plan semanal completo generado en segundos según el objetivo',
                  'Lista de compras categorizada, lista al instante',
                  'Ficha médica digital con documentos adjuntos',
                  'Todo en un solo lugar: pacientes, planes, citas y documentos',
                  'Plantillas reutilizables por objetivo clínico',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-emerald-700">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ────────────────────────────────── */}
      <section id="funciones" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Diseñado específicamente para el flujo de trabajo de un nutricionista — no un software genérico adaptado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────── */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              De cero a plan completo en 4 pasos
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Sin curvas de aprendizaje. Si sabes usar WhatsApp, sabes usar NutriFlow.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-10 bottom-10 w-px bg-emerald-100 hidden sm:block" />

            <div className="space-y-8">
              {STEPS.map(({ n, title, desc }, i) => (
                <div key={n} className="flex items-start gap-6">
                  <div className="relative flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 z-10">
                    {n}
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Empezar ahora — es gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonios ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-emerald-600">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Lo que dicen los nutricionistas
            </h2>
            <p className="text-emerald-200 text-lg">
              Profesionales que pasaron de Excel a NutriFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-emerald-200 text-sm">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ────────────────────────────────────────── */}
      <section id="precios" className="py-20 px-4 sm:px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Precio simple y transparente
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Sin contratos. Sin sorpresas. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Plan gratis */}
            <div className="rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Gratis</h3>
              <p className="text-gray-500 text-sm mb-6">Para empezar sin riesgo</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-1">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Hasta 5 pacientes activos',
                  'Generación de planes',
                  'Lista de compras',
                  'Ficha médica básica',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Plan profesional */}
            <div className="rounded-2xl border-2 border-emerald-500 p-8 relative shadow-xl shadow-emerald-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white">
                Más popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profesional</h3>
              <p className="text-gray-500 text-sm mb-6">Para nutricionistas activos</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$12.900</span>
                <span className="text-gray-500 ml-1">/mes CLP</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Pacientes ilimitados',
                  'Todo el plan gratis incluido',
                  'Exportar plan como PDF',
                  'Documentos adjuntos ilimitados',
                  'Soporte prioritario',
                  'Nuevas funciones primero',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Probar 30 días gratis
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Precios en pesos chilenos (CLP) · IVA incluido
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={q}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm">{q}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ml-4 ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Deja de perder tiempo en Excel
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
            Únete a los nutricionistas que ya automatizan sus planes y tienen más tiempo para lo que importa: sus pacientes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-xl"
            >
              Empezar gratis ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="text-sm text-emerald-100 hover:text-white transition-colors"
            >
              Ya tengo cuenta — iniciar sesión
            </Link>
          </div>
          <p className="mt-6 text-emerald-200 text-sm">
            Sin tarjeta de crédito · Sin permanencia · Configura en 5 minutos
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-white">NutriFlow</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                La herramienta de gestión nutricional diseñada para nutricionistas en Chile y Latinoamérica.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Producto</h4>
                <ul className="space-y-2 text-sm">
                  {['Funciones','Precios','FAQ'].map(l => (
                    <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Cuenta</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="cursor-default">Privacidad</span></li>
                  <li><span className="cursor-default">Términos</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm">© 2026 NutriFlow · Hecho en Chile</p>
            <div className="flex items-center gap-1 text-sm">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Datos seguros con cifrado end-to-end
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
