/**
 * Until the unary ListAuctions RPC exists, the lobby needs *some* set of ids to
 * resolve through GetAuctionDetails. Every auction this browser creates or opens
 * is remembered here so the app is fully usable today; once /api/auction/list
 * ships it becomes the source of truth and this is only a fallback.
 */
const KEY = 'auction.knownRooms.v1'
const LIMIT = 40

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, LIMIT)))
  } catch {
    // Private mode / quota — the lobby just falls back to an empty list.
  }
}

export const localRooms = {
  list: read,
  remember(id: string) {
    const trimmed = id.trim()
    if (!trimmed) return
    write([trimmed, ...read().filter((x) => x !== trimmed)])
  },
  forget(id: string) {
    write(read().filter((x) => x !== id))
  },
}
