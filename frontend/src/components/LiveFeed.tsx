import { formatClock, formatMoney } from '../lib/format'
import type { LiveAuctionUpdate } from '../lib/types'
import { Avatar } from './ui/Avatar'
import { EmptyState } from './ui/EmptyState'

interface Props {
  updates: LiveAuctionUpdate[]
  connecting: boolean
}

/** WatchAuctionRoom — every frame the server pushes while the room is open. */
export function LiveFeed({ updates, connecting }: Props) {
  if (updates.length === 0) {
    return (
      <EmptyState
        icon="broadcast"
        title={connecting ? 'Akışa bağlanılıyor…' : 'Henüz canlı hareket yok'}
        description="Odaya yeni bir teklif düştüğü anda burada görünecek."
      />
    )
  }

  return (
    <ol className="feed scroller">
      {updates.map((u, index) => (
        <li
          key={`${u.timestamp}-${index}`}
          className={`feed__item${index === 0 ? ' feed__item--latest fade-in' : ''}`}
        >
          <Avatar name={u.leaderName || '?'} size={32} />
          <div className="stack gap-2 grow">
            <span className="row gap-8 wrap">
              <strong className="feed__name">{u.leaderName || 'Bilinmeyen'}</strong>
              {index === 0 && <span className="pill pill--active">önde</span>}
            </span>
            <span className="tiny muted mono">{formatClock(u.timestamp)}</span>
          </div>
          <span className="feed__amount mono">{formatMoney(u.highestBid)}</span>
        </li>
      ))}
    </ol>
  )
}
