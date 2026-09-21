package com.live.auction_client.api.mapper;

import com.google.protobuf.Timestamp;
import com.live.auction.grpc.*;
import com.live.auction_client.api.dto.*;

import java.time.Instant;

public class AuctionMapper {
    public static CreateAuctionRequest convertToCreateAuctionRequest(CreateAuctionRequestDto requestDto) {
        return CreateAuctionRequest.newBuilder()
                .setTitle(requestDto.title())
                .setDescription(requestDto.description())
                .setStartPrice(requestDto.startPrice())
                .setEndTime(convertToProtoTimestamp(requestDto.endTime()))
                .build();
    }
    public static AuctionResponseDto convertToAuctionResponseDto(AuctionResponse response) {
        return new AuctionResponseDto(response.getAuctionId(), response.getStatus().toString());
    }

    public static Timestamp convertToProtoTimestamp(Instant instant) {
        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
    public static Instant convertToJavaInstant(Timestamp timestamp) {
        return Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos());
    }

    public static AuctionDetailResponseDto convertToDetailResponseDto(AuctionDetailResponse auction) {
        return AuctionDetailResponseDto.builder()
                .auctionId(auction.getAuctionId())
                .description(auction.getAuctionDescription())
                .status(auction.getStatus().toString())
                .endTime(Instant.ofEpochSecond(auction.getEndTime().getSeconds(), auction.getEndTime().getNanos()))
                .highestBid(auction.getCurrentHighestBid())
                .build();
    }

    public static BidHistoryResponseDto convertToBidHistoryDto(BidHistoryResponse historyResponse) {
        return new BidHistoryResponseDto(
                historyResponse.getBidderName(),
                historyResponse.getBidAmount(),
                convertToJavaInstant(historyResponse.getBidCreationTime())
        );
    }

    public static LiveAuctionResponseDto convertToLiveAuctionDto(LiveAuctionUpdate liveAuction) {
        return new LiveAuctionResponseDto(liveAuction.getAuctionId(), liveAuction.getLeaderName(), liveAuction.getNewHighestBid(), convertToJavaInstant(liveAuction.getTimestamp()));
    }

    public static CreateBidRequest convertToBidRequest(CreateBidRequestDto request) {
        return CreateBidRequest.newBuilder()
                .setAuctionId(request.auctionId())
                .setUserId(request.userId())
                .setAmount(request.amount())
                .build();
    }

    public static PlaceBidResponseDto convertToBidResponse(PlaceBidResponse responseDto) {
        return new PlaceBidResponseDto(responseDto.getIsSuccessful(), responseDto.getMessage());
    }
}
