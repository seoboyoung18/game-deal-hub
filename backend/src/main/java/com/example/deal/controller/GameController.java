package com.example.deal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.deal.dto.GameDetailResponse;
import com.example.deal.service.GameService;

import lombok.RequiredArgsConstructor;

/**
 * 게임 상세 API.
 */
@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /** 게임 상세 + 스토어별 가격 비교 (FR-06). */
    @GetMapping("/{gameId}")
    public GameDetailResponse getGame(@PathVariable String gameId) {
        return gameService.getGameDetail(gameId);
    }
}
