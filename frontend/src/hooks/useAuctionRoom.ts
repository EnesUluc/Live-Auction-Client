import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, streams } from '../lib/api'
import { localRooms } from '../lib/localRooms'
import type { AuctionDetail, BidHistoryItem, LiveAuctionUpdate } from '../lib/types'
import { useEventStream } from './useEventStream'

const MAX_FEED = 60

/**
 * Everything a room needs, wired to the three RPCs that serve it:
 *   GetAuctionDetails (unary)  — the static card + the seed highest bid
 *   WatchAuctionRoom  (stream) — live leader / highest-bid updates
 *   GetAuctionHistory (stream) — the finite bid log
 */
export function useAuctionRoom(auctionId: string) {
  const [detail, setDetail] = useState<AuctionDetail | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)

  const [feed, setFeed] = useState<LiveAuctionUpdate[]>([])
  const [history, setHistory] = useState<BidHistoryItem[]>([])

  const loadDetail = useCallback(async () => {
    setDetailLoading(true)
    try {
      const data = await api.getAuction(auctionId)
      setDetail(data)
      setDetailError(null)
      localRooms.remember(auctionId)
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Açık artırma bulunamadı.')
    } finally {
      setDetailLoading(false)
    }
  }, [auctionId])

  useEffect(() => {
    setDetail(null)
    setFeed([])
    setHistory([])
    void loadDetail()
  }, [loadDetail])

  // --- live room stream (kept open, reconnects on drop) ---
  const onLive = useCallback((update: LiveAuctionUpdate) => {
    setFeed((prev) => [update, ...prev].slice(0, MAX_FEED))
  }, [])

  const room = useEventStream<LiveAuctionUpdate>(streams.room(auctionId), {
    event: 'live-auction',
    onMessage: onLive,
    reconnect: true,
  })

  // --- history stream (finite: completes by itself) ---
  const onHistory = useCallback((item: BidHistoryItem) => {
    setHistory((prev) => [...prev, item])
  }, [])

  const onHistoryOpen = useCallback(() => setHistory([]), [])

  const historyStream = useEventStream<BidHistoryItem>(streams.history(auctionId), {
    event: 'history-item',
    onMessage: onHistory,
    onOpen: onHistoryOpen,
  })

  /** Live updates win over the unary snapshot; both fall back to the other. */
  const latest = feed[0] ?? null
  const highestBid = useMemo(() => {
    const fromFeed = latest?.highestBid
    const fromDetail = detail?.highestBid
    if (typeof fromFeed === 'number' && typeof fromDetail === 'number') {
      return Math.max(fromFeed, fromDetail)
    }
    return fromFeed ?? fromDetail ?? null
  }, [latest, detail])

  const leaderName = latest?.leaderName ?? history.at(-1)?.name ?? null

  // Debounced re-sync: a burst of live updates should trigger one unary refresh.
  const resyncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (!latest) return
    clearTimeout(resyncTimer.current)
    resyncTimer.current = setTimeout(() => void loadDetail(), 1200)
    return () => clearTimeout(resyncTimer.current)
  }, [latest, loadDetail])

  return {
    detail,
    detailError,
    detailLoading,
    reloadDetail: loadDetail,
    feed,
    history,
    highestBid,
    leaderName,
    room,
    historyStream,
    replayHistory: historyStream.restart,
  }
}
