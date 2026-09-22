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

  // onClose gets a fresh identity on every parent render; keeping it in a ref
  // stops the effects below from re-running (and stealing focus) on each keystroke.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  // Autofocus the first field once per opening — never the close button.
  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('.modal__body input, .modal__body textarea')?.focus()
  }, [open])

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
