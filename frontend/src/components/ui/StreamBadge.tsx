import type { StreamStatus } from '../../hooks/useEventStream'
import { Icon } from './Icon'

const COPY: Record<StreamStatus, { label: string; tone: string }> = {
  idle: { label: 'Beklemede', tone: 'pill--finished' },
  connecting: { label: 'Bağlanıyor', tone: 'pill--amber' },
  live: { label: 'Canlı akış', tone: 'pill--active' },
  ended: { label: 'Akış tamamlandı', tone: 'pill--finished' },
  error: { label: 'Bağlantı koptu', tone: 'pill--canceled' },
}

interface Props {
  status: StreamStatus
  attempt?: number
  onRetry?: () => void
}

/** Makes the state of a gRPC server-stream (bridged over SSE) visible at a glance. */
export function StreamBadge({ status, attempt = 0, onRetry }: Props) {
  const { label, tone } = COPY[status]
  const showRetry = onRetry && (status === 'error' || status === 'ended')

  return (
    <span className="row gap-8">
      <span className={`pill ${tone}`}>
        {status === 'live' ? (
          <span className="dot dot--pulse" />
        ) : status === 'connecting' ? (
          <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.6 }} />
        ) : (
          <span className="dot" />
        )}
        {label}
        {status === 'connecting' && attempt > 0 ? ` · ${attempt}. deneme` : ''}
      </span>
      {showRetry && (
        <button className="btn btn--quiet btn--sm" onClick={onRetry}>
          <Icon name="refresh" size={13} />
          Yeniden
        </button>
      )}
    </span>
  )
}
