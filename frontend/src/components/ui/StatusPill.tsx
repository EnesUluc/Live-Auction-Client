import type { AuctionStatus } from '../../lib/types'

const LABEL: Record<AuctionStatus, string> = {
  ACTIVE: 'Canlı',
  FINISHED: 'Bitti',
  CANCELED: 'İptal',
}

const TONE: Record<AuctionStatus, string> = {
  ACTIVE: 'pill--active',
  FINISHED: 'pill--finished',
  CANCELED: 'pill--canceled',
}

export function StatusPill({ status }: { status: AuctionStatus | null | undefined }) {
  if (!status) return <span className="pill pill--finished">—</span>
  return (
    <span className={`pill ${TONE[status] ?? 'pill--finished'}`}>
      <span className={`dot${status === 'ACTIVE' ? ' dot--pulse' : ''}`} />
      {LABEL[status] ?? status}
    </span>
  )
}
