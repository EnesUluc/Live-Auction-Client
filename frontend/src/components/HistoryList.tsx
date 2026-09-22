import { formatDateTime, formatMoney } from '../lib/format'
import type { BidHistoryItem } from '../lib/types'
import { Avatar } from './ui/Avatar'
import { EmptyState } from './ui/EmptyState'

interface Props {
  items: BidHistoryItem[]
  loading: boolean
}

/** GetAuctionHistory — a finite server stream, rendered newest-first. */
export function HistoryList({ items, loading }: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="history"
        title={loading ? 'Geçmiş yükleniyor…' : 'Bu odada henüz teklif verilmemiş'}
        description="Sunucu geçmişi akış halinde gönderir; gelen her kayıt anında listeye eklenir."
      />
    )
  }

  const ordered = [...items].reverse()
  const top = Math.max(...items.map((i) => i.amount ?? 0))

  return (
    <ol className="feed scroller">
      {ordered.map((item, index) => {
        const leading = (item.amount ?? 0) === top
        return (
          <li key={`${item.creationTime}-${index}`} className="feed__item">
            <Avatar name={item.name || '?'} size={32} />
            <div className="stack gap-2 grow">
              <span className="row gap-8 wrap">
                <strong className="feed__name">{item.name || 'Bilinmeyen'}</strong>
                {leading && <span className="pill pill--amber">en yüksek</span>}
              </span>
              <span className="tiny muted mono">{formatDateTime(item.creationTime)}</span>
            </div>
            <span className={`feed__amount mono${leading ? ' feed__amount--top' : ''}`}>
              {formatMoney(item.amount)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
