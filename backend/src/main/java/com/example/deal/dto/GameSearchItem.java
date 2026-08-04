package com.example.deal.dto;

import java.math.BigDecimal;

import lombok.Data;

/** 검색 결과 항목(게임 단위). 최저가 + 판매 스토어 요약. (GET /api/games/search) */
@Data
public class GameSearchItem {

    private String gameId;
    private String title;
    private String thumbUrl;
    private BigDecimal minSalePrice;   // 이 게임의 스토어 통틀어 최저 할인가
    private String currency;
    private int storeCount;
    private String storeNames;         // '|' 로 구분된 스토어명 목록
}
