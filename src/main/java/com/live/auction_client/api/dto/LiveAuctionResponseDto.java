package com.live.auction_client.api.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record LiveAuctionResponseDto(String auctionId, String leaderName, Double highestBid, Instant timestamp) {}
