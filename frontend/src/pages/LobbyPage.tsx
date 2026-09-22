import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuctionCard } from '../components/AuctionCard'
import { AuctionCardSkeleton } from '../components/AuctionCardSkeleton'
import { CreateAuctionDialog } from '../components/CreateAuctionDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { useAuctionList } from '../hooks/useAuctionList'
import { formatMoney } from '../lib/format'
import { localRooms } from '../lib/localRooms'
import type { AuctionStatus } from '../lib/types'

type Filter = 'ALL' | AuctionStatus
type Sort = 'ending' | 'price' | 'title'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'ACTIVE', label: 'Canlı' },
  { id: 'FINISHED', label: 'Biten' },
  { id: 'CANCELED', label: 'İptal' },
]

export function LobbyPage() {
  const navigate = useNavigate()
  const { auctions, loading, error, source, refresh } = useAuctionList()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [sort, setSort] = useState<Sort>('ending')
  const [createOpen, setCreateOpen] = useState(false)
  const [joinId, setJoinId] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr')
    return auctions
      .filter((a) => (filter === 'ALL' ? true : a.status === filter))
      .filter((a) => {
        if (!needle) return true
        return [a.title, a.description, a.auctionId]
          .filter(Boolean)
          .some((v) => v!.toLocaleLowerCase('tr').includes(needle))
      })
      .sort((a, b) => {
        if (sort === 'price') return (b.highestBid ?? 0) - (a.highestBid ?? 0)
        if (sort === 'title') return (a.title ?? '').localeCompare(b.title ?? '', 'tr')
        const at = a.endTime ? new Date(a.endTime).getTime() : Number.MAX_SAFE_INTEGER
        const bt = b.endTime ? new Date(b.endTime).getTime() : Number.MAX_SAFE_INTEGER
        return at - bt
      })
  }, [auctions, query, filter, sort])

  const stats = useMemo(() => {
    const active = auctions.filter((a) => a.status === 'ACTIVE').length
    const top = auctions.reduce((max, a) => Math.max(max, a.highestBid ?? 0), 0)
    return { total: auctions.length, active, top }
  }, [auctions])

  const forget = (id: string) => {
    localRooms.forget(id)
    void refresh()
  }

  const join = (e: React.FormEvent) => {
    e.preventDefault()
    const id = joinId.trim()
    if (id) navigate(`/room/${encodeURIComponent(id)}`)
  }

  return (
    <div className="container page">
      <section className="hero">
        <div className="stack gap-12 grow">
          <span className="pill pill--accent">
            <span className="dot dot--pulse" />
            Canlı açık artırma odaları
          </span>
          <h1 className="hero__title">Açık artırmalar</h1>
          <p className="hero__lede soft">
            Bir odaya girdiğinde teklif akışı sunucudan canlı olarak gelir; teklifin ise tek
            çağrılık bir unary RPC ile gönderilir.
          </p>

          <div className="row gap-10 wrap">
            <button className="btn btn--primary btn--lg" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={16} />
              Yeni açık artırma
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => void refresh()} disabled={loading}>
              {loading ? <span className="spinner" /> : <Icon name="refresh" size={16} />}
              Yenile
            </button>
          </div>
        </div>

        <div className="hero__stats">
          <div className="stat">
            <span className="stat__label">Toplam oda</span>
            <span className="stat__value mono">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Canlı</span>
            <span className="stat__value mono" style={{ color: 'var(--sage-ink)' }}>
              {stats.active}
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">En yüksek teklif</span>
            <span className="stat__value mono">{formatMoney(stats.top || null)}</span>
          </div>
        </div>
      </section>

      {source === 'fallback' && (
        <div className="callout callout--info">
          <Icon name="alert" size={16} />
          <div className="stack gap-4">
            <strong className="small">
              <code className="code">GET /api/auction/list</code> henüz yok — yerel listeye düşüldü.
            </strong>
            <span className="small">
              Şu an yalnızca bu tarayıcıda oluşturduğun/açtığın odalar{' '}
              <code className="code">GetAuctionDetails</code> ile tek tek çözülüyor. Unary{' '}
              <code className="code">ListAuctions</code> eklendiğinde liste otomatik olarak oradan gelir.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="callout callout--error">
          <Icon name="alert" size={16} />
          <div className="stack gap-4">
            <strong className="small">Odalar yüklenemedi</strong>
            <span className="small">{error}</span>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={() => void refresh()}>
            Tekrar dene
          </button>
        </div>
      )}

      <section className="toolbar">
        <div className="input-group toolbar__search">
          <Icon name="search" size={16} className="muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık, açıklama veya ID ara"
            aria-label="Odalarda ara"
          />
          {query && (
            <button className="btn btn--quiet btn--sm" onClick={() => setQuery('')} aria-label="Temizle">
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        <div className="segmented" role="group" aria-label="Duruma göre filtrele">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="select toolbar__sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sırala"
        >
          <option value="ending">Önce bitmek üzere</option>
          <option value="price">En yüksek teklif</option>
          <option value="title">Başlığa göre</option>
        </select>
      </section>

      {loading && auctions.length === 0 ? (
        <div className="grid">
          {Array.from({ length: 6 }, (_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="grid">
          {visible.map((auction) => (
            <AuctionCard
              key={auction.auctionId}
              auction={auction}
              onForget={source === 'fallback' ? forget : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={auctions.length === 0 ? 'gavel' : 'search'}
            title={auctions.length === 0 ? 'Henüz oda yok' : 'Eşleşen oda yok'}
            description={
              auctions.length === 0
                ? 'İlk açık artırmayı oluştur ya da elindeki bir ID ile doğrudan odaya gir.'
                : 'Arama terimini veya filtreyi değiştirmeyi dene.'
            }
            action={
              auctions.length === 0 ? (
                <button className="btn btn--primary btn--sm" onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" size={14} />
                  Açık artırma oluştur
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      <section className="card card--pad join-card">
        <div className="stack gap-4 grow">
          <strong className="small">ID ile odaya gir</strong>
          <span className="tiny muted">
            Listede görünmeyen bir açık artırmanın ID'sini biliyorsan doğrudan bağlanabilirsin.
          </span>
        </div>
        <form className="row gap-8 join-card__form" onSubmit={join}>
          <div className="input-group grow">
            <Icon name="link" size={15} className="muted" />
            <input
              className="mono"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="auction-id"
              aria-label="Açık artırma ID"
            />
          </div>
          <button className="btn btn--ghost" type="submit" disabled={!joinId.trim()}>
            <Icon name="door" size={15} />
            Gir
          </button>
        </form>
      </section>

      <CreateAuctionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refresh()}
      />
    </div>
  )
}
