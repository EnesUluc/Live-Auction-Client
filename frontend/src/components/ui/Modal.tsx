import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

interface Props {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, subtitle, onClose, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('input, textarea, button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <div
        className="modal__panel fade-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <div className="stack gap-4">
            <h2 className="modal__title">{title}</h2>
            {subtitle && <p className="small muted">{subtitle}</p>}
          </div>
          <button className="btn btn--quiet btn--icon" onClick={onClose} aria-label="Kapat">
            <Icon name="x" />
          </button>
        </header>
        <div className="modal__body scroller">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
