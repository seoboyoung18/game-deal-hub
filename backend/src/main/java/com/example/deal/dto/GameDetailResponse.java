package com.example.deal.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

/** 게임 상세 + 스토어별 가격 비교. (GET /api/games/{id}) */
@Data
public class GameDetailResponse {

    private String gameId;
    private String title;
    private String steamAppId;
    private String thumbUrl;
    private Integer metacriticScore;
    private Integer steamRatingPct;
    private LocalDateTime releaseDate;
    private String genres;             // 한국어 장르 '|' 구분 (스팀 메타 보강)
    private String shortDescKo;        // 한국어 짧은 소개문
    private List<StorePriceRow> deals;
}
