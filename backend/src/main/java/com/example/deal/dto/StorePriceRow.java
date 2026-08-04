package com.example.deal.dto;

import java.math.BigDecimal;

import lombok.Data;

/** 게임 상세의 스토어별 가격 한 행. (GET /api/games/{id} 의 deals 항목) */
@Data
public class StorePriceRow {

    private String dealId;
    private String storeId;
    private String storeName;
    private BigDecimal salePrice;
    private BigDecimal normalPrice;
    private BigDecimal savings;
    private String currency;
    private BigDecimal krwSalePrice;    // 스팀 실제 원화(있으면)
    private BigDecimal krwNormalPrice;
    private boolean best;               // 최저가 여부(서비스에서 표시)
}
