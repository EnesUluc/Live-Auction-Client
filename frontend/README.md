# Live Auction — Frontend

React + TypeScript + Vite arayüzü. Spring Boot BFF (`:8080`) üzerinden gRPC
`LiveAuctionService`'i tüketir. **Backend kodunda hiçbir değişiklik yapılmadı.**

## Çalıştırma

```bash
# 1) gRPC sunucusu   :9090
# 2) Spring BFF      :8080   ->  ./mvnw spring-boot:run
# 3) Frontend        :5173
cd frontend
npm install
npm run dev
```

`vite.config.ts` içindeki proxy `/api/**` isteklerini `localhost:8080`'e yönlendirir;
böylece tarayıcı açısından her şey aynı origin'dedir ve backend'e CORS eklemeye gerek kalmaz.

## Endpoint eşlemesi

| RPC (auction.proto) | Tip | HTTP | Nerede kullanılıyor |
| --- | --- | --- | --- |
| `CreateAuction` | unary | `POST /api/auction/` | `CreateAuctionDialog` |
| `GetAuctionDetails` | unary | `GET /api/auction/?id=` | Oda başlığı, lobi fallback listesi |
| `PlaceBid` | unary | `POST /api/auction/bid` | `BidPanel` |
| `WatchAuctionRoom` | server streaming | `GET /api/auction/{id}/room` (SSE, event: `live-auction`) | Oda → "Canlı akış" |
| `GetAuctionHistory` | server streaming | `GET /api/auction/{id}/history` (SSE, event: `history-item`) | Oda → "Teklif geçmişi" |

### Akış yönetimi

`src/hooks/useEventStream.ts` tarayıcının otomatik yeniden bağlanmasını devre dışı
bırakır ve politikayı kendisi uygular:

- **Room** (`reconnect: true`) — kopmada üstel geri çekilme ile 6 denemeye kadar yeniden bağlanır.
- **History** (`reconnect: false`) — sunucu `onCompleted()` çağırınca akış "tamamlandı"
  olarak işaretlenir; kullanıcı isterse "Yeniden" ile tekrar oynatır.

## ⚠️ Eksik endpoint: oda listesi

Lobi `GET /api/auction/list` çağırır. Bu route backend'de **henüz yok**; frontend 404
aldığında bu tarayıcının bildiği ID'leri `GetAuctionDetails` ile tek tek çözen bir
fallback'e düşer ve bunu ekranda açıkça belirtir. Endpoint eklendiği anda liste
otomatik olarak oradan gelmeye başlar — frontend'de değişiklik gerekmez.

Beklenen sözleşme:

```
GET /api/auction/list   ->   200 application/json
[
  {
    "auctionId":   "a1b2c3",
    "title":       "1963 model saat",
    "description": "Orijinal kayış",
    "status":      "ACTIVE",
    "endTime":     "2026-09-22T18:00:00Z",
    "highestBid":  1500.0
  }
]
```

`status` alanı `ACTIVE | FINISHED | CANCELED` değerlerinden biri, `endTime` ise
ISO-8601 `Instant`. Yani gövde, mevcut `AuctionDetailResponseDto` listesidir —
yeni bir DTO yazmana gerek yok.

Önerilen proto eki:

```proto
rpc ListAuctions(ListAuctionsRequest) returns (ListAuctionsResponse);

message ListAuctionsRequest {
  AuctionStatus status = 1;  // opsiyonel filtre
  int32 page_size = 2;
}

message ListAuctionsResponse {
  repeated AuctionDetailResponse auctions = 1;
}
```

## Dizin yapısı

```
src/
  lib/        api istemcisi, DTO tipleri, biçimlendirme, yerel oda kaydı
  hooks/      useEventStream (SSE), useAuctionList, useAuctionRoom, useCountdown
  context/    kimlik (user_id), tema, toast
  components/ kart, teklif paneli, akışlar, modal ve ui/ altındaki küçük parçalar
  pages/      LobbyPage (oda listesi), RoomPage (oda), NotFoundPage
  styles/     theme.css (token'lar) + global.css + components.css
```

Tüm renkler `src/styles/theme.css` içindeki CSS değişkenlerinden gelir; açık ve koyu
tema aynı token setini paylaşır.
