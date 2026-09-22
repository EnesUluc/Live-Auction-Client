import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, api } from '../lib/api'
import { localRooms } from '../lib/localRooms'
import type { AuctionSummary } from '../lib/types'

/** Where the lobby data came from — surfaced in the UI so the gap is never silent. */
export type ListSource = 'endpoint' | 'fallback'

interface State {
  loading: boolean
  auctions: AuctionSummary[]
  error: string | null
  source: ListSource
}

const INITIAL: State = { loading: true, auctions: [], error: null, source: 'endpoint' }

/**
 * Prefers GET /api/auction/list (planned unary ListAuctions).
 * While that route is missing, falls back to resolving the ids this browser
 * knows about through GetAuctionDetails, one unary call each.
 */
export function useAuctionList() {
  const [state, setState] = useState<State>(INITIAL)
  const runId = useRef(0)

  const load = useCallback(async () => {
    const run = ++runId.current
    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      const auctions = await api.listAuctions()
      if (run !== runId.current) return
      auctions.forEach((a) => localRooms.remember(a.auctionId))
      setState({ loading: false, auctions, error: null, source: 'endpoint' })
      return
    } catch (err) {
      if (run !== runId.current) return
      if (!(err instanceof ApiError) || !err.notImplemented) {
        setState({
          loading: false,
          auctions: [],
          error: err instanceof Error ? err.message : 'Odalar yüklenemedi.',
          source: 'endpoint',
        })
        return
      }
      // falls through to the per-id fallback below
    }

    const ids = localRooms.list()
    const settled = await Promise.allSettled(ids.map((id) => api.getAuction(id)))
    if (run !== runId.current) return

    const auctions: AuctionSummary[] = []
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') auctions.push(result.value)
      // A 404 means the auction is gone server-side; stop tracking it.
      else if (result.reason instanceof ApiError && result.reason.status === 404) {
        localRooms.forget(ids[index])
      }
    })

    setState({ loading: false, auctions, error: null, source: 'fallback' })
  }, [])

  useEffect(() => {
    void load()
    return () => {
      runId.current++
    }
  }, [load])

  return { ...state, refresh: load }
}
