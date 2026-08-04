package com.example.deal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.deal.dto.GameDetailResponse;
import com.example.deal.dto.GameSearchItem;
import com.example.deal.dto.PageResponse;
import com.example.deal.dto.StorePriceRow;
import com.example.deal.exception.NotFoundException;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;

/**
 * 게임 상세 조립 + 검색.
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

    /** 제목 부분일치 검색(게임 단위). 빈 검색어는 빈 결과. */
    public PageResponse<GameSearchItem> searchGames(String q, int page, int size) {
        String query = q == null ? "" : q.trim();
        int p = Math.max(page, 0);
        int s = Math.min(Math.max(size, 1), 100);
        if (query.isEmpty()) {
            return PageResponse.of(List.of(), p, s, 0);
        }
        int offset = p * s;
        List<GameSearchItem> content = dealMapper.searchGames(query, offset, s);
        long total = dealMapper.countSearchGames(query);
        return PageResponse.of(content, p, s, total);
    }
}
