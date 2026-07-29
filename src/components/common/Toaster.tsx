import { useToastStore, type ToastKind } from '../../lib/toast'

const styles: Record<ToastKind, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-800 text-white',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto min-w-[260px] max-w-sm rounded-lg shadow-lg px-4 py-3 text-sm text-left ${styles[t.kind]} transition-all animate-in slide-in-from-right`}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
