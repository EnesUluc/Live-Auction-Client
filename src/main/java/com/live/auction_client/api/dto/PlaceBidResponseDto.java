package com.live.auction_client.api.dto;

import lombok.Builder;

@Builder
public record PlaceBidResponseDto(boolean isSuccessful, String message) {}
