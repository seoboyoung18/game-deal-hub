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
    private List<StorePriceRow> deals;
}
