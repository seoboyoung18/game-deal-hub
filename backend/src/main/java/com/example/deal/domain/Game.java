package com.example.deal.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게임 엔티티. 스토어를 넘어 "같은 게임"을 묶는 단위.
 * game_id 는 CheapShark gameID — 스토어가 달라도 같은 게임이면 동일.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    private String gameId;          // PK, CheapShark gameID
    private String title;
    private String steamAppId;      // 스팀에 없는 게임도 있어 nullable
    private String thumbUrl;
    private Integer metacriticScore;
    private Integer steamRatingPct;  // 스팀 긍정 리뷰 %
    private LocalDateTime releaseDate;
}
