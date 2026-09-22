import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown'
import { formatDateTime, formatMoney, shortId } from '../lib/format'
import type { AuctionSummary } from '../lib/types'
import { Icon } from './ui/Icon'
import { StatusPill } from './ui/StatusPill'

interface Props {
  auction: AuctionSummary
  onForget?: (id: string) => void
}

export function AuctionCard({ auction, onForget }: Props) {
  const { label, expired } = useCountdown(auction.endTime)
  const live = auction.status === 'ACTIVE' && !expired

  return (
    <article className={`auction-card${live ? ' auction-card--live' : ''}`}>
      <header className="row between gap-12">
        <StatusPill status={auction.status} />
        <span className="tiny mono muted" title={auction.auctionId}>
          {shortId(auction.auctionId)}
        </span>
      </header>

      <div className="stack gap-6">
        <h3 className="auction-card__title">{auction.title?.trim() || 'İsimsiz açık artırma'}</h3>
        <p className="auction-card__desc small soft">
          {auction.description?.trim() || 'Açıklama girilmemiş.'}
        </p>
      </div>

      <dl className="auction-card__stats">
        <div>
          <dt>Güncel teklif</dt>
          <dd className="mono auction-card__price">{formatMoney(auction.highestBid)}</dd>
        </div>
        <div>
          <dt>{live ? 'Kalan süre' : 'Bitiş'}</dt>
          <dd className="mono">
            {live && label ? label : formatDateTime(auction.endTime)}
          </dd>
        </div>
      </dl>

      <footer className="row between gap-8">
        <Link className="btn btn--primary btn--sm" to={`/room/${encodeURIComponent(auction.auctionId)}`}>
          <Icon name="door" size={14} />
          Odaya gir
        </Link>
        {onForget && (
          <button
            className="btn btn--quiet btn--sm"
            onClick={() => onForget(auction.auctionId)}
            aria-label="Listeden kaldır"
            title="Bu odayı yerel listeden kaldır"
          >
            <Icon name="trash" size={14} />
          </button>
        )}
      </footer>
    </article>
  )
}
