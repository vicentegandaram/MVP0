import { create } from 'zustand'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
  ask: (options: ConfirmOptions) => Promise<boolean>
  answer: (value: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve })
    }),
  answer: (value) => {
    const { resolve } = get()
    resolve?.(value)
    set({ open: false, options: null, resolve: null })
  },
}))

export const confirm = (message: string, options?: Omit<ConfirmOptions, 'message'>) =>
  useConfirmStore.getState().ask({ message, ...options })
