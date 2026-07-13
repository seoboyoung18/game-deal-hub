package com.example.deal.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 스토어 엔티티. CheapShark /stores 응답 기반.
 * store_id 는 CheapShark storeID("1" = Steam).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Store {

    private String storeId;     // PK, CheapShark storeID
    private String storeName;
    private Boolean active;      // is_active — 문 닫은 스토어 걸러내기
    private String iconUrl;
}
