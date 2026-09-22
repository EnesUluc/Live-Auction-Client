import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { localRooms } from '../lib/localRooms'
import { Icon } from './ui/Icon'
import { Modal } from './ui/Modal'

/** datetime-local wants a local-time "YYYY-MM-DDTHH:mm" string, not an ISO instant. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

const DURATIONS = [
  { label: '15 dk', minutes: 15 },
  { label: '1 saat', minutes: 60 },
  { label: '6 saat', minutes: 360 },
  { label: '1 gün', minutes: 1440 },
]

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateAuctionDialog({ open, onClose, onCreated }: Props) {
  const navigate = useNavigate()
  const { push } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startPrice, setStartPrice] = useState('100')
  const [endTime, setEndTime] = useState(() => toLocalInput(new Date(Date.now() + 3600_000)))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setTitle('')
    setDescription('')
    setStartPrice('100')
    setEndTime(toLocalInput(new Date(Date.now() + 3600_000)))
    setError(null)
  }

  const close = () => {
    if (busy) return
    onClose()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const price = Number(startPrice)
    const deadline = new Date(endTime)

    if (!title.trim()) return setError('Başlık zorunlu.')
    if (!Number.isFinite(price) || price < 0) return setError('Başlangıç fiyatı geçerli bir sayı olmalı.')
    if (Number.isNaN(deadline.getTime())) return setError('Bitiş zamanı geçersiz.')
    if (deadline.getTime() <= Date.now()) return setError('Bitiş zamanı gelecekte olmalı.')

    setBusy(true)
    try {
      // CreateAuction — unary. endTime is serialised as an ISO-8601 Instant.
      const res = await api.createAuction({
        title: title.trim(),
        description: description.trim(),
        startPrice: price,
        endTime: deadline.toISOString(),
      })
      localRooms.remember(res.id)
      push('success', 'Açık artırma oluşturuldu', `Durum: ${res.status}`)
      reset()
      onCreated()
      onClose()
      navigate(`/room/${encodeURIComponent(res.id)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oluşturulamadı.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Yeni açık artırma"
      subtitle="CreateAuction · unary RPC"
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={close} disabled={busy}>
            Vazgeç
          </button>
          <button type="submit" form="create-auction" className="btn btn--primary" disabled={busy}>
            {busy ? <span className="spinner" /> : <Icon name="gavel" size={15} />}
            Oluştur
          </button>
        </>
      }
    >
      <form id="create-auction" className="stack gap-16" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="ca-title">
            Başlık
          </label>
          <input
            id="ca-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn. 1963 model saat"
            maxLength={120}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ca-desc">
            Açıklama
          </label>
          <textarea
            id="ca-desc"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ürünün durumu, teslimat notları…"
            maxLength={600}
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field__label" htmlFor="ca-price">
              Başlangıç fiyatı
            </label>
            <div className="input-group">
              <input
                id="ca-price"
                type="number"
                min={0}
                step="0.01"
                className="mono"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
              />
              <span className="input-group__affix">TRY</span>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="ca-end">
              Bitiş zamanı
            </label>
            <input
              id="ca-end"
              type="datetime-local"
              className="input mono"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="row gap-8 wrap">
          <span className="tiny muted">Hızlı süre:</span>
          {DURATIONS.map((d) => (
            <button
              key={d.minutes}
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setEndTime(toLocalInput(new Date(Date.now() + d.minutes * 60_000)))}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="callout callout--error small">
            <Icon name="alert" size={15} />
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
