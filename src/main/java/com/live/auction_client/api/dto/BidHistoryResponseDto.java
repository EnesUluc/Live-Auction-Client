package com.live.auction_client.api.dto;

import java.time.Instant;

public record BidHistoryResponseDto(String name, Double amount, Instant creationTime) {}
