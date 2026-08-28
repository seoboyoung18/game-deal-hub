package com.example.deal.dto;

import java.math.BigDecimal;

import lombok.Data;

/**
 * 게임 한 건의 현재 최저가 스냅샷. 가격 알림(클라이언트 보관)이 목표가와 비교할 때 쓴다.
 * (GET /api/games/prices?ids=...)
 */
@Data
public class GamePriceSnapshot {

    private String gameId;
    private String title;
    private String thumbUrl;
    private String dealId;
    private String storeId;
    private String storeName;
    private BigDecimal salePrice;      // 이 게임의 스토어 통틀어 최저 할인가 (USD)
    private BigDecimal normalPrice;
    private BigDecimal savings;
    private BigDecimal krwSalePrice;   // 스팀이면 실제 원화, 아니면 null
}
