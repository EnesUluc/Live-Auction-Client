import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BidPanel } from '../components/BidPanel'
import { HistoryList } from '../components/HistoryList'
import { LiveFeed } from '../components/LiveFeed'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { StatusPill } from '../components/ui/StatusPill'
import { StreamBadge } from '../components/ui/StreamBadge'
import { useToast } from '../context/ToastContext'
import { useAuctionRoom } from '../hooks/useAuctionRoom'
import { useCountdown } from '../hooks/useCountdown'
import { formatDateTime, formatMoney } from '../lib/format'

type Tab = 'live' | 'history'

export function RoomPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { push } = useToast()
  const [tab, setTab] = useState<Tab>('live')

  const {
    detail,
    detailError,
    detailLoading,
    reloadDetail,
    feed,
    history,
    highestBid,
    leaderName,
    room,
    historyStream,
    replayHistory,
  } = useAuctionRoom(id)

  const { label: remaining, expired } = useCountdown(detail?.endTime)
  const biddable = detail?.status === 'ACTIVE' && !expired

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id)
      push('info', 'ID kopyalandı')
    } catch {
      push('error', 'Kopyalanamadı', 'Tarayıcı panoya erişime izin vermedi.')
    }
  }

  if (detailError) {
    return (
      <div className="container page">
        <Link className="btn btn--quiet btn--sm back-link" to="/">
          <Icon name="arrowLeft" size={14} />
          Odalara dön
        </Link>
        <div className="card">
          <EmptyState
            icon="alert"
            title="Oda açılamadı"
            description={detailError}
            action={
              <button className="btn btn--ghost btn--sm" onClick={() => void reloadDetail()}>
                <Icon name="refresh" size={14} />
                Tekrar dene
              </button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <Link className="btn btn--quiet btn--sm back-link" to="/">
        <Icon name="arrowLeft" size={14} />
        Odalara dön
      </Link>

      <header className="room-head">
        <div className="stack gap-10 grow">
          <div className="row gap-10 wrap">
            <StatusPill status={detail?.status} />
            <StreamBadge status={room.status} attempt={room.attempt} onRetry={room.restart} />
          </div>

          {detailLoading && !detail ? (
            <span className="skeleton" style={{ width: '48%', height: 30 }} />
          ) : (
            <h1 className="room-head__title">
              {detail?.title?.trim() || 'İsimsiz açık artırma'}
            </h1>
          )}

          <p className="soft room-head__desc">
            {detail?.description?.trim() || 'Bu açık artırma için açıklama girilmemiş.'}
          </p>

          <div className="row gap-8 wrap tiny muted">
            <button className="chip-btn mono" onClick={copyId} title="ID'yi kopyala">
              <Icon name="link" size={12} />
              {id}
            </button>
            <span className="row gap-6">
              <Icon name="clock" size={13} />
              Bitiş: <span className="mono">{formatDateTime(detail?.endTime)}</span>
            </span>
          </div>
        </div>

        <aside className="price-board">
          <span className="price-board__label">Güncel en yüksek teklif</span>
          <span className="price-board__value mono">{formatMoney(highestBid)}</span>
          <span className="price-board__leader">
            {leaderName ? (
              <>
                <Icon name="trend" size={14} />
                Önde: <strong>{leaderName}</strong>
              </>
            ) : (
              'Henüz teklif yok'
            )}
          </span>
          <div className="price-board__timer">
            <Icon name="clock" size={14} />
            {expired ? 'Süre doldu' : remaining ? `${remaining} kaldı` : '—'}
          </div>
        </aside>
      </header>

      <div className="room-grid">
        <section className="card room-main">
          <div className="card__head">
            <div className="segmented" role="tablist" aria-label="Akış seçimi">
              <button
                role="tab"
                aria-pressed={tab === 'live'}
                aria-selected={tab === 'live'}
                onClick={() => setTab('live')}
              >
                Canlı akış {feed.length > 0 && <span className="count">{feed.length}</span>}
              </button>
              <button
                role="tab"
                aria-pressed={tab === 'history'}
                aria-selected={tab === 'history'}
                onClick={() => setTab('history')}
              >
                Teklif geçmişi {history.length > 0 && <span className="count">{history.length}</span>}
              </button>
            </div>

            {tab === 'live' ? (
              <span className="tiny muted">WatchAuctionRoom · server streaming</span>
            ) : (
              <StreamBadge status={historyStream.status} onRetry={replayHistory} />
            )}
          </div>

          <div className="room-main__body" role="tabpanel">
            {tab === 'live' ? (
              <LiveFeed updates={feed} connecting={room.status === 'connecting'} />
            ) : (
              <HistoryList items={history} loading={historyStream.status === 'connecting'} />
            )}
          </div>
        </section>

        <div className="stack gap-16 room-aside">
          <BidPanel
            auctionId={id}
            highestBid={highestBid}
            biddable={Boolean(biddable)}
            disabledReason={
              detail?.status === 'ACTIVE'
                ? 'Süre dolduğu için teklif kapalı.'
                : 'Açık artırma aktif değil, teklif verilemez.'
            }
            onPlaced={reloadDetail}
          />

          <section className="card">
            <header className="card__head">
              <span className="card__title">Oda bilgisi</span>
              <button
                className="btn btn--quiet btn--sm"
                onClick={() => void reloadDetail()}
                disabled={detailLoading}
                title="GetAuctionDetails ile yeniden çek"
              >
                {detailLoading ? <span className="spinner" /> : <Icon name="refresh" size={14} />}
              </button>
            </header>
            <dl className="meta">
              <div>
                <dt>Durum</dt>
                <dd>{detail?.status ?? '—'}</dd>
              </div>
              <div>
                <dt>Bitiş</dt>
                <dd className="mono">{formatDateTime(detail?.endTime)}</dd>
              </div>
              <div>
                <dt>Snapshot teklif</dt>
                <dd className="mono">{formatMoney(detail?.highestBid)}</dd>
              </div>
              <div>
                <dt>Canlı kayıt</dt>
                <dd className="mono">{feed.length}</dd>
              </div>
              <div>
                <dt>Geçmiş kaydı</dt>
                <dd className="mono">{history.length}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
