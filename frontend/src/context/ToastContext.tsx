import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  title: string
  detail?: string
}

const ToastContext = createContext<{
  push: (tone: ToastTone, title: string, detail?: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, title: string, detail?: string) => {
      const id = ++seq.current
      setToasts((list) => [...list.slice(-3), { id, tone, title, detail }])
      setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone} fade-in`}>
            <span className="toast__dot" aria-hidden="true" />
            <div className="stack gap-4">
              <strong className="toast__title">{t.title}</strong>
              {t.detail && <span className="toast__detail">{t.detail}</span>}
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Kapat">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
