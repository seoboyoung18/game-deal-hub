package com.example.deal.fetcher.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

/**
 * CheapShark /deals 응답 원본 1건.
 * 함정: 가격/할인율/판매여부는 모두 "문자열", 시간(releaseDate/lastChange)은 epoch 정수(초).
 * 한 건에 게임 정보 + 딜 정보가 함께 담겨 온다.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CheapSharkDeal {

    private String dealID;
    private String title;
    private String storeID;
    private String gameID;

    private String salePrice;           // "7.49"
    private String normalPrice;         // "19.99"
    private String savings;             // "62.531266" (6자리 소수)
    private String dealRating;          // "10.0" 등 (CheapShark 품질·가성비 점수)
    private String isOnSale;            // "1" / "0"

    private String metacriticScore;     // "0" 등
    private String steamRatingPercent;  // "89"
    private String steamAppID;          // null 가능

    private Long releaseDate;           // epoch seconds
    private Long lastChange;            // epoch seconds
    private String thumb;               // 커버 썸네일 URL
}
