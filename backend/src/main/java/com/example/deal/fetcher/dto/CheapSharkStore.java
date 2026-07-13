package com.example.deal.fetcher.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

/**
 * CheapShark /stores 응답 원본 1건.
 * isActive 는 JSON 숫자(1/0)로 내려온다(주의: /deals 의 isOnSale 은 문자열).
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CheapSharkStore {

    private String storeID;
    private String storeName;
    private Integer isActive;   // 1 = 운영중, 0 = 폐점
    private Images images;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Images {
        private String banner;
        private String logo;
        private String icon;     // 상대경로 예: /img/stores/icons/0.png
    }
}
