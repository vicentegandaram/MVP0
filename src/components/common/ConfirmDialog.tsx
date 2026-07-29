import { useConfirmStore } from '../../lib/confirm'

export function ConfirmDialog() {
  const { open, options, answer } = useConfirmStore()

  if (!open || !options) return null

  const {
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    destructive = false,
  } = options

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        {title && (
          <div className="px-5 pt-5 pb-2 text-base font-semibold text-gray-900">{title}</div>
        )}
        <div className={`px-5 ${title ? 'pb-5' : 'py-5'} text-sm text-gray-700 whitespace-pre-line`}>
          {message}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            onClick={() => answer(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={() => answer(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
