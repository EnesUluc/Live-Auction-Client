package com.live.auction_client.api.dto;

import lombok.Builder;

@Builder
public record CreateBidRequestDto(String auctionId, String userId, Double amount) {}
