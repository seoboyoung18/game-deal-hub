package com.example.deal.dto;

import java.math.BigDecimal;

import lombok.Data;

/**
 * 딜 목록/카드용 응답 DTO. deals × games × stores 조인 결과.
 * (GET /api/deals content 항목)
 */
@Data
public class DealResponse {

    private String dealId;
    private String title;
    private String gameId;
    private String storeId;
    private String storeName;
    private BigDecimal salePrice;
    private BigDecimal normalPrice;
    private BigDecimal savings;
    private String currency;
    private String thumbUrl;
}
