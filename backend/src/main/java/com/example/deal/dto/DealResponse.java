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
    private BigDecimal krwSalePrice;   // 스팀 실제 원화(있으면 프론트가 우선 사용)
    private BigDecimal krwNormalPrice;
    private String thumbUrl;
    private String genres;             // 한국어 장르 '|' 구분 (스팀 메타 보강, 없으면 null)
    private String koreanSupport;      // 'voice'(음성까지) | 'sub'(자막) | null
}
