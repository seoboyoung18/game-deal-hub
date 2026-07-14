package com.example.deal.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.deal.domain.Deal;
import com.example.deal.fetcher.StoreFetcher;
import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 수집 오케스트레이션: fetch(raw) → normalize → upsert.
 * 저장 순서 store → game → deal (FK).
 * 여러 정렬(sort-list)로 수집해 인기 게임(Deal Rating)과 초고할인(Savings)을 함께 확보.
 * 중복 딜은 UPSERT 로 병합된다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DealService {

    private final StoreFetcher fetcher;   // 현재 구현: CheapSharkFetcher
    private final Normalizer normalizer;
    private final DealMapper dealMapper;

    /** 수집에 사용할 CheapShark 정렬들. 정렬마다 상위 몇 페이지씩 긁어 다양성을 확보. */
    @Value("${cheapshark.collect.sort-list:Deal Rating,Savings}")
    private String[] sortList;

    @Value("${cheapshark.collect.max-pages:8}")
    private int maxPages;

    @Value("${cheapshark.collect.page-size:60}")
    private int pageSize;

    /** 1회 수집. */
    @Transactional
    public CollectResult collectOnce() {
        long start = System.currentTimeMillis();

        // 1) 스토어 (deals 의 FK 대상 → 먼저 적재)
        List<CheapSharkStore> rawStores = fetcher.fetchStores();
        for (CheapSharkStore s : rawStores) {
            dealMapper.upsertStore(normalizer.toStore(s));
        }
        log.info("[수집] 스토어 {}건 upsert", rawStores.size());

        // 2) 딜 — 정렬별 × 페이지별. 게임 upsert 후 딜 upsert.
        int fetched = 0;
        int skippedFree = 0;
        for (String sortByRaw : sortList) {
            String sortBy = sortByRaw.trim();
            for (int page = 0; page < maxPages; page++) {
                List<CheapSharkDeal> rawDeals = fetcher.fetchDeals(page, pageSize, sortBy);
                if (rawDeals.isEmpty()) {
                    break;
                }
                for (CheapSharkDeal d : rawDeals) {
                    Deal deal = normalizer.toDeal(d);
                    // 원래 무료(정가 0) 게임 제외 — '정가가 있는데 무료로 푸는' 진짜 딜만 저장
                    if (deal.getNormalPrice() == null || deal.getNormalPrice().signum() <= 0) {
                        skippedFree++;
                        continue;
                    }
                    dealMapper.upsertGame(normalizer.toGame(d));
                    dealMapper.upsertDeal(deal);
                }
                fetched += rawDeals.size();
            }
            log.info("[수집] 정렬 '{}' 완료", sortBy);
        }

        long totalDeals = dealMapper.countDeals();
        long elapsed = System.currentTimeMillis() - start;
        log.info("[수집] 완료 — 스토어 {}건 · 조회 {}건(중복 포함) · 정가0 제외 {}건 · 저장된 딜 총 {}건 · {}ms",
                rawStores.size(), fetched, skippedFree, totalDeals, elapsed);
        return new CollectResult(rawStores.size(), fetched, totalDeals, elapsed);
    }

    public record CollectResult(int stores, int fetched, long totalDeals, long elapsedMs) {}
}
