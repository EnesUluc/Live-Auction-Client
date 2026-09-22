import { useEffect, useState } from 'react'
import { useIdentity } from '../context/IdentityContext'
import { Icon } from './ui/Icon'
import { Modal } from './ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  /** Shown when the dialog was opened because a bid needs an identity first. */
  reason?: string
}

export function IdentityDialog({ open, onClose, reason }: Props) {
  const { userId, setUserId } = useIdentity()
  const [value, setValue] = useState(userId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValue(userId)
      setError(null)
    }
  }, [open, userId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = value.trim()
    if (next.length < 2) return setError('En az 2 karakter olmalı.')
    if (next.length > 40) return setError('En fazla 40 karakter.')
    setUserId(next)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kimliğin"
      subtitle="PlaceBid çağrısında user_id olarak gönderilir"
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" form="identity-form" className="btn btn--primary">
            <Icon name="check" size={15} />
            Kaydet
          </button>
        </>
      }
    >
      <form id="identity-form" className="stack gap-14" onSubmit={submit}>
        {reason && (
          <p className="callout callout--info small">
            <Icon name="alert" size={15} />
            {reason}
          </p>
        )}
        <div className="field">
          <label className="field__label" htmlFor="identity-input">
            Görünen ad
          </label>
          <input
            id="identity-input"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="örn. enes"
            autoComplete="off"
          />
          <span className="field__hint">
            Bu isim teklif geçmişinde ve canlı akışta diğer katılımcılara görünür.
          </span>
        </div>
        {error && <span className="field__error">{error}</span>}
      </form>
    </Modal>
  )
}
