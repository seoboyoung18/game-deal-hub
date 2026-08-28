package com.example.deal.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.example.deal.dto.GameDetailResponse;
import com.example.deal.dto.GamePriceSnapshot;
import com.example.deal.dto.GameSearchItem;
import com.example.deal.dto.PageResponse;
import com.example.deal.dto.StorePriceRow;
import com.example.deal.exception.NotFoundException;
import com.example.deal.fetcher.SteamSearchFetcher;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;

/**
 * 게임 상세 조립 + 검색.
 * 한글 검색어는 DB 제목(영어)으로 못 찾으므로 스팀 한국어 검색(storesearch)으로
 * appid 를 받아 매칭한다 — 검색 그 질의에 한해서만 외부 호출.
 */
@Service
@RequiredArgsConstructor
public class GameService {

    private static final Pattern HANGUL = Pattern.compile("[가-힣]");

    /** 알림 목록 상한(프론트 localStorage 상한과 맞춤) — IN 절 폭주 방지. */
    private static final int MAX_PRICE_IDS = 50;

    private final DealMapper dealMapper;
    private final SteamSearchFetcher steamSearchFetcher;

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
        game.setAllTimeLow(dealMapper.findAllTimeLow(gameId)); // 수집 시작 이후 최저
        game.setPriceHistory(dealMapper.findPriceHistory(gameId));
        return game;
    }

    /**
     * 여러 게임의 현재 최저가. 가격 알림은 로그인이 없어 브라우저(localStorage)에 담아두고,
     * 여기서 받은 최저가와 목표가를 클라이언트가 비교한다.
     */
    public List<GamePriceSnapshot> getLowestPrices(List<String> gameIds) {
        if (gameIds == null || gameIds.isEmpty()) {
            return List.of();
        }
        List<String> ids = gameIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .distinct()
                .limit(MAX_PRICE_IDS)
                .toList();
        if (ids.isEmpty()) {
            return List.of();
        }
        return dealMapper.findLowestPrices(ids);
    }

    /** 제목 부분일치 검색(게임 단위). 한글이면 스팀 매칭 우선. 빈 검색어는 빈 결과. */
    public PageResponse<GameSearchItem> searchGames(String q, int page, int size) {
        String query = q == null ? "" : q.trim();
        int p = Math.max(page, 0);
        int s = Math.min(Math.max(size, 1), 100);
        if (query.isEmpty()) {
            return PageResponse.of(List.of(), p, s, 0);
        }

        // 한글 질의 → 스팀 한국어 검색으로 appid 확보 → 우리 DB 매칭 (결과 ≤10이라 페이징 없음)
        if (HANGUL.matcher(query).find()) {
            List<String> appIds = steamSearchFetcher.searchAppIds(query);
            if (!appIds.isEmpty()) {
                List<GameSearchItem> content = dealMapper.searchGamesByAppIds(appIds);
                if (!content.isEmpty()) {
                    return PageResponse.of(content, 0, s, content.size());
                }
            }
            // 스팀에서 못 찾았거나 우리 DB에 없음 → ILIKE 폴백 (한글 제목이 없어 대부분 0건)
        }

        int offset = p * s;
        List<GameSearchItem> content = dealMapper.searchGames(query, offset, s);
        long total = dealMapper.countSearchGames(query);
        return PageResponse.of(content, p, s, total);
    }
}
