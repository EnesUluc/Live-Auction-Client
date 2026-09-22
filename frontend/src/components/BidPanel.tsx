import { useEffect, useState } from 'react'
import { useIdentity } from '../context/IdentityContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { formatMoney } from '../lib/format'
import { IdentityDialog } from './IdentityDialog'
import { Icon } from './ui/Icon'

interface Props {
  auctionId: string
  highestBid: number | null
  /** ACTIVE + not expired — anything else disables bidding. */
  biddable: boolean
  disabledReason?: string
  onPlaced: () => void
}

const STEPS = [50, 100, 500, 1000]

/** PlaceBid — a single unary call; the resulting change arrives back over the room stream. */
export function BidPanel({ auctionId, highestBid, biddable, disabledReason, onPlaced }: Props) {
  const { userId, isSet } = useIdentity()
  const { push } = useToast()

  const floor = highestBid ?? 0
  const suggested = floor > 0 ? Math.round(floor * 1.05) : 100

  const [amount, setAmount] = useState<string>(() => String(suggested))
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [identityOpen, setIdentityOpen] = useState(false)

  // Follow the live price until the user starts typing their own number.
  useEffect(() => {
    if (!touched) setAmount(String(suggested))
  }, [suggested, touched])

  const numeric = Number(amount)
  const tooLow = Number.isFinite(numeric) && numeric <= floor
  const invalid = !Number.isFinite(numeric) || numeric <= 0

  const bump = (step: number) => {
    setTouched(true)
    const base = Number.isFinite(numeric) && numeric > 0 ? numeric : floor
    setAmount(String(Math.round(base + step)))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSet) {
      setIdentityOpen(true)
      return
    }
    if (invalid) return

    setBusy(true)
    setResult(null)
    try {
      const res = await api.placeBid({ auctionId, userId, amount: numeric })
      setResult({ ok: res.isSuccessful, message: res.message })
      if (res.isSuccessful) {
        push('success', 'Teklif iletildi', `${formatMoney(numeric)} · ${userId}`)
        setTouched(false)
        onPlaced()
      } else {
        push('error', 'Teklif reddedildi', res.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Teklif gönderilemedi.'
      setResult({ ok: false, message })
      push('error', 'Teklif gönderilemedi', message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card bid-panel">
      <header className="card__head">
        <span className="card__title">Teklif ver</span>
        <span className="pill pill--accent">unary</span>
      </header>

      <form className="card__body stack gap-14" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="bid-amount">
            Teklif tutarı
          </label>
          <div className="input-group">
            <input
              id="bid-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              className="mono bid-panel__input"
              value={amount}
              onChange={(e) => {
                setTouched(true)
                setAmount(e.target.value)
              }}
              disabled={!biddable || busy}
            />
            <span className="input-group__affix">TRY</span>
          </div>
          <span className="field__hint">
            Güncel en yüksek: <strong className="mono">{formatMoney(highestBid)}</strong>
          </span>
        </div>

        <div className="row gap-6 wrap">
          {STEPS.map((step) => (
            <button
              key={step}
              type="button"
              className="btn btn--ghost btn--sm mono"
              onClick={() => bump(step)}
              disabled={!biddable || busy}
            >
              +{step}
            </button>
          ))}
        </div>

        {tooLow && biddable && (
          <span className="field__error">
            Bu tutar mevcut en yüksek teklifin altında — sunucu büyük ihtimalle reddedecek.
          </span>
        )}

        <button className="btn btn--primary btn--lg btn--block" disabled={!biddable || busy || invalid}>
          {busy ? <span className="spinner" /> : <Icon name="gavel" size={16} />}
          {isSet ? 'Teklifi gönder' : 'Önce kimlik seç'}
        </button>

        {!biddable && disabledReason && (
          <p className="callout callout--muted small">
            <Icon name="alert" size={15} />
            {disabledReason}
          </p>
        )}

        {result && (
          <p className={`callout small ${result.ok ? 'callout--success' : 'callout--error'}`}>
            <Icon name={result.ok ? 'check' : 'alert'} size={15} />
            {result.message || (result.ok ? 'Teklif kabul edildi.' : 'Teklif reddedildi.')}
          </p>
        )}

        <span className="tiny muted">
          Gönderen: <strong>{isSet ? userId : '—'}</strong>{' '}
          <button type="button" className="linklike" onClick={() => setIdentityOpen(true)}>
            değiştir
          </button>
        </span>
      </form>

      <IdentityDialog
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        reason={!isSet ? 'Teklif verebilmek için bir görünen ad seçmelisin.' : undefined}
      />
    </section>
  )
}
