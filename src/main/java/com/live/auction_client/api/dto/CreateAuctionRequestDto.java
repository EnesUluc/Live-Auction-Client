package com.live.auction_client.api.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record CreateAuctionRequestDto(String title, String description, Double startPrice, Instant endTime) {}
