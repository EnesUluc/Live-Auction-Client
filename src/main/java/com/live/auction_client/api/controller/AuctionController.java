package com.live.auction_client.api.controller;

import com.live.auction_client.api.dto.*;
import com.live.auction_client.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/auction")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;

    @PostMapping("/")
    public AuctionResponseDto create(@RequestBody CreateAuctionRequestDto request){
        return auctionService.create(request);
    }

    @GetMapping("/")
    public AuctionDetailResponseDto getDetails(@RequestParam("id") String id) {
        return auctionService.getDetails(id);
    }

    @PostMapping("/bid")
    public PlaceBidResponseDto createBid(@RequestBody CreateBidRequestDto request){
        return auctionService.placeBid(request);
    }

    // Produces TEXT_EVENT_STREAM_VALUE to inform the client that this is a continuous data flow, not a single JSON.
    @GetMapping(value = "/{id}/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getHistory(@PathVariable String id){
        return auctionService.getAuctionHistoryStream(id);
    }

    @GetMapping(value = "/{id}/room", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getAuctionRoom(@PathVariable String id){
        return auctionService.watchAuctionRoom(id);
    }

}
