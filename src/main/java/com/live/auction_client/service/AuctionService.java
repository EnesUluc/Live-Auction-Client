package com.live.auction_client.service;

import com.google.protobuf.Timestamp;
import com.live.auction.grpc.*;
import com.live.auction_client.api.dto.*;
import com.live.auction_client.api.mapper.AuctionMapper;
import io.grpc.Channel;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.client.GrpcChannelFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuctionService {
    private final LiveAuctionServiceGrpc.LiveAuctionServiceBlockingStub blockingStub;
    private final LiveAuctionServiceGrpc.LiveAuctionServiceStub asyncStub;

    public AuctionService(GrpcChannelFactory channelFactory) {
        Channel channel = channelFactory.createChannel("auctionService");

        this.blockingStub = LiveAuctionServiceGrpc.newBlockingStub(channel);
        this.asyncStub = LiveAuctionServiceGrpc.newStub(channel);
    }

    public AuctionResponseDto create(CreateAuctionRequestDto requestDto) {
        CreateAuctionRequest auctionRequest = AuctionMapper.convertToCreateAuctionRequest(requestDto);

        AuctionResponse response = blockingStub.createAuction(auctionRequest);

        return AuctionMapper.convertToAuctionResponseDto(response);
    }

    public AuctionDetailResponseDto getDetails(String id) {
        AuctionDetailResponse auction = blockingStub.getAuctionDetails(AuctionRequest.newBuilder().setAuctionId(id).build());
        return AuctionMapper.convertToDetailResponseDto(auction);
    }

    public List<AuctionDetailResponseDto> getLiveAuctions() {
        Empty empty = Empty.newBuilder().build();
        LiveAuctionList liveList = blockingStub.getLiveAuctions(empty);

        List<AuctionDetailResponseDto> response = new ArrayList<>();

        for (AuctionDetailResponse detailResponse : liveList.getAuctionDetailList()) {
            response.add(AuctionMapper.convertToDetailResponseDto(detailResponse));
        }

        return response;
    }

    public PlaceBidResponseDto placeBid(CreateBidRequestDto request) {
        CreateBidRequest createRequest = AuctionMapper.convertToBidRequest(request);

        PlaceBidResponse responseDto = blockingStub.placeBid(createRequest);

        return AuctionMapper.convertToBidResponse(responseDto);
    }

    public SseEmitter getAuctionHistoryStream(String auctionId) {
        // Initialize SSE connection with infinite timeout (-1L).
        // This instructs Tomcat to keep the HTTP connection open until we explicitly close it.
        SseEmitter emitter = new SseEmitter(-1L);

        AuctionRequest request = AuctionRequest.newBuilder().setAuctionId(auctionId).build();

        // Execute the asynchronous gRPC call and attach a StreamObserver to listen to the data flow
        asyncStub.getAuctionHistory(request, new StreamObserver<BidHistoryResponse>(){

            @Override
            public void onNext(BidHistoryResponse historyResponse) {
                try {
                    BidHistoryResponseDto dto = AuctionMapper.convertToBidHistoryDto(historyResponse);

                    // Push the data chunk to the client immediately as an SSE event.
                    // The "name" is crucial; the frontend will add am EventListener for "history-item"
                    emitter.send(SseEmitter.event().name("history-item").data(dto));
                }catch (IOException e) {
                    // If the client forcefully disconnects (e.g., closes the browser tab or refreshes),
                    // an IOException occurs. We catch it to terminate the dead stream safely.
                    emitter.completeWithError(e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                // Relay any underlying gRPC errors (e.g., database failure) to the frontend
                emitter.completeWithError(throwable);
            }

            @Override
            public void onCompleted() {
                // Gracefully close the SSE connection when the gRPC server signals the end of the stream
                emitter.complete();
            }
        } );

        // Return the emitter immediately to establish the HTTP connection.
        // Data will flow asynchronously through the onNext callback in the background.
        return emitter;
    }

    public SseEmitter watchAuctionRoom(String auctionId) {
        SseEmitter emitter = new SseEmitter(-1L);

        AuctionRequest request = AuctionRequest.newBuilder().setAuctionId(auctionId).build();

        asyncStub.watchAuctionRoom(request, new StreamObserver<LiveAuctionUpdate>() {

            @Override
            public void onNext(LiveAuctionUpdate liveAuctionUpdate) {
                try {
                    LiveAuctionResponseDto dto = AuctionMapper.convertToLiveAuctionDto(liveAuctionUpdate);

                    emitter.send(SseEmitter.event().name("live-auction").data(dto));
                }catch (IOException e) {
                    emitter.completeWithError(e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                emitter.completeWithError(throwable);
            }

            @Override
            public void onCompleted() {
                emitter.complete();
            }
        });

        emitter.onTimeout(emitter::complete);
        emitter.onCompletion(() -> System.out.println("Room watch stream completed for auction: " + auctionId));

        return emitter;
    }


}
