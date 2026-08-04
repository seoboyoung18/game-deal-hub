package com.example.deal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.deal.dto.GameDetailResponse;
import com.example.deal.dto.StorePriceRow;
import com.example.deal.exception.NotFoundException;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;

/**
 * 게임 상세 조립: 메타 + 스토어별 가격 비교(최저가 표시).
 */
@Service
@RequiredArgsConstructor
public class GameService {

    private final DealMapper dealMapper;

    public GameDetailResponse getGameDetail(String gameId) {
        GameDetailResponse game = dealMapper.findGameMeta(gameId);
        if (game == null) {
            throw new NotFoundException("game not found: " + gameId);
        }
        List<StorePriceRow> deals = dealMapper.findGameDeals(gameId); // sale_price ASC
        if (!deals.isEmpty()) {
            deals.get(0).setBest(true); // 최저가
        }
        game.setDeals(deals);
        return game;
    }
}
