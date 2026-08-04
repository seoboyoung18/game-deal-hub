package com.example.deal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.deal.dto.GameDetailResponse;
import com.example.deal.dto.GameSearchItem;
import com.example.deal.dto.PageResponse;
import com.example.deal.service.GameService;

import lombok.RequiredArgsConstructor;

/**
 * 게임 상세 · 검색 API.
 */
@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /** 게임 제목 검색 (부분 일치). /{gameId} 보다 우선 매칭됨(리터럴 경로). */
    @GetMapping("/search")
    public PageResponse<GameSearchItem> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return gameService.searchGames(q, page, size);
    }

    /** 게임 상세 + 스토어별 가격 비교 (FR-06). */
    @GetMapping("/{gameId}")
    public GameDetailResponse getGame(@PathVariable String gameId) {
        return gameService.getGameDetail(gameId);
    }
}
