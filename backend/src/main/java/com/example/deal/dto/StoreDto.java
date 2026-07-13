package com.example.deal.dto;

import lombok.Data;

/**
 * 스토어 목록 응답 DTO. 프론트 필터 칩 구성용. (GET /api/stores)
 */
@Data
public class StoreDto {

    private String storeId;
    private String storeName;
    private String iconUrl;
}
