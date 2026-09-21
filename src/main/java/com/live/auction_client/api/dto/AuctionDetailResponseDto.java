package com.live.auction_client.api.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record AuctionDetailResponseDto(String auctionId, String title, String description, String status, Instant endTime, Double highestBid) {}
