package com.example.deal.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.deal.fetcher.StoreFetcher;
import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 수집 오케스트레이션: fetch(raw) → normalize → upsert.
 * 저장 순서 store → game → deal (FK).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DealService {

    private final StoreFetcher fetcher;   // 현재 구현: CheapSharkFetcher
    private final Normalizer normalizer;
    private final DealMapper dealMapper;

    @Value("${cheapshark.collect.max-pages:5}")
    private int maxPages;

    @Value("${cheapshark.collect.page-size:60}")
    private int pageSize;

    /** 1회 수집. 외부 호출 시간을 짧게 유지하기 위해 read/connect 타임아웃이 걸려 있다. */
    @Transactional
    public CollectResult collectOnce() {
        long start = System.currentTimeMillis();

        // 1) 스토어 (deals 의 FK 대상 → 먼저 적재)
        List<CheapSharkStore> rawStores = fetcher.fetchStores();
        for (CheapSharkStore s : rawStores) {
            dealMapper.upsertStore(normalizer.toStore(s));
        }
        log.info("[수집] 스토어 {}건 upsert", rawStores.size());

        // 2) 딜 (페이지 단위) → 게임 upsert 후 딜 upsert
        int dealCount = 0;
        for (int page = 0; page < maxPages; page++) {
            List<CheapSharkDeal> rawDeals = fetcher.fetchDeals(page, pageSize);
            if (rawDeals.isEmpty()) {
                break;
            }
            for (CheapSharkDeal d : rawDeals) {
                dealMapper.upsertGame(normalizer.toGame(d));
                dealMapper.upsertDeal(normalizer.toDeal(d));
            }
            dealCount += rawDeals.size();
        }

        long elapsed = System.currentTimeMillis() - start;
        log.info("[수집] 완료 — 스토어 {}건 · 딜 {}건 · {}ms", rawStores.size(), dealCount, elapsed);
        return new CollectResult(rawStores.size(), dealCount, elapsed);
    }

    public record CollectResult(int stores, int deals, long elapsedMs) {}
}
