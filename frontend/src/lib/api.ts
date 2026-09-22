import type {
  AuctionDetail,
  AuctionResponse,
  AuctionSummary,
  CreateAuctionRequest,
  CreateBidRequest,
  PlaceBidResult,
} from './types'

const BASE = '/api/auction'

export class ApiError extends Error {
  readonly status: number
  /** true when the route itself is missing — used to detect the not-yet-built list endpoint */
  readonly notImplemented: boolean

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.notImplemented = status === 404 || status === 405 || status === 501
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : null),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Sunucuya ulaşılamadı. BFF (:8080) çalışıyor mu?')
  }

  if (!res.ok) {
    // GlobalExceptionHandler maps gRPC Status codes to { "error": "..." }
    const payload = await res.json().catch(() => null)
    const detail =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as Record<string, unknown>).error)
        : null) ?? `${res.status} ${res.statusText}`
    throw new ApiError(res.status, cleanGrpcMessage(detail))
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** "NOT_FOUND: no auction with id x" reads better without the gRPC status prefix. */
function cleanGrpcMessage(raw: string): string {
  return raw.replace(/^[A-Z_]+:\s*/, '').trim() || raw
}

export const api = {
  /** Unary → CreateAuction */
  createAuction(body: CreateAuctionRequest) {
    return request<AuctionResponse>(`${BASE}/`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  /** Unary → GetAuctionDetails */
  getAuction(id: string) {
    return request<AuctionDetail>(`${BASE}/?id=${encodeURIComponent(id)}`)
  },

  /** Unary → PlaceBid. Jackson may emit either key for the boolean record component. */
  async placeBid(body: CreateBidRequest): Promise<PlaceBidResult> {
    const raw = await request<Record<string, unknown>>(`${BASE}/bid`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return {
      isSuccessful: Boolean(raw.isSuccessful ?? raw.successful),
      message: String(raw.message ?? ''),
    }
  },

  /**
   * Unary → ListAuctions.  NOT YET IMPLEMENTED on the backend.
   * Expected: GET /api/auction/list  →  AuctionDetailResponseDto[]
   */
  listAuctions() {
    return request<AuctionSummary[]>(`${BASE}/list`)
  },
}

/** Server-sent event stream URLs (gRPC server-streaming, bridged by SseEmitter). */
export const streams = {
  /** WatchAuctionRoom — event name: "live-auction" */
  room: (id: string) => `${BASE}/${encodeURIComponent(id)}/room`,
  /** GetAuctionHistory — event name: "history-item" */
  history: (id: string) => `${BASE}/${encodeURIComponent(id)}/history`,
}
