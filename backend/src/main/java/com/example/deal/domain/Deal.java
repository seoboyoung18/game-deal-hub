package com.example.deal.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 딜 엔티티. deal 하나 = 게임 x 스토어 x 가격.
 * 가격은 NUMERIC -> BigDecimal (FLOAT 금지, 돈 계산 오차).
 * 시간은 epoch 정수 -> LocalDateTime(UTC) 로 변환해 저장.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Deal {

    private String dealId;          // PK, CheapShark dealID
    private String gameId;          // FK -> games
    private String storeId;         // FK -> stores
    private BigDecimal salePrice;
    private BigDecimal normalPrice;
    private BigDecimal savings;      // 할인율 %, 예: 62.53
    private BigDecimal dealRating;   // CheapShark dealRating(품질·가성비 점수, 추천순 정렬용)
    private String currency;         // 지금은 전부 'USD'
    private Boolean onSale;          // is_on_sale
    private LocalDateTime lastChange;
    private LocalDateTime updatedAt;
}
