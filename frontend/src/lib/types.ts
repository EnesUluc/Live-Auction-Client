/**
 * Mirrors the DTO records exposed by the Spring Boot BFF
 * (com.live.auction_client.api.dto.*), which in turn mirror auction.proto.
 */

/** proto: enum AuctionStatus */
export type AuctionStatus = 'ACTIVE' | 'FINISHED' | 'CANCELED'

/** POST /api/auction/  →  CreateAuctionRequestDto */
export interface CreateAuctionRequest {
  title: string
  description: string
  startPrice: number
  /** java.time.Instant — ISO-8601 with trailing Z */
  endTime: string
}

/** POST /api/auction/  ←  AuctionResponseDto */
export interface AuctionResponse {
  id: string
  status: AuctionStatus
}

/** GET /api/auction/?id=...  ←  AuctionDetailResponseDto */
export interface AuctionDetail {
  auctionId: string
  title: string | null
  description: string | null
  status: AuctionStatus
  endTime: string | null
  highestBid: number | null
}

/** POST /api/auction/bid  →  CreateBidRequestDto */
export interface CreateBidRequest {
  auctionId: string
  userId: string
  amount: number
}

/** POST /api/auction/bid  ←  PlaceBidResponseDto */
export interface PlaceBidResult {
  isSuccessful: boolean
  message: string
}

/** GET /api/auction/{id}/history  ←  SSE event "history-item" (BidHistoryResponseDto) */
export interface BidHistoryItem {
  name: string
  amount: number
  creationTime: string
}

/** GET /api/auction/{id}/room  ←  SSE event "live-auction" (LiveAuctionResponseDto) */
export interface LiveAuctionUpdate {
  auctionId: string
  leaderName: string
  highestBid: number
  timestamp: string
}

/**
 * GET /api/auction/list  ←  not implemented on the backend yet.
 * Shape intentionally identical to AuctionDetailResponseDto so the same
 * mapper / DTO can be reused for the planned unary ListAuctions RPC.
 */
export type AuctionSummary = AuctionDetail
