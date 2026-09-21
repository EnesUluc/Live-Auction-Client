package com.live.auction_client.api.dto;

import lombok.Builder;

@Builder
public record AuctionResponseDto(String id, String status) {}
