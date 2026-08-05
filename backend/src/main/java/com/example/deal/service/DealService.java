package com.example.deal.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.deal.domain.Deal;
import com.example.deal.dto.GameMetaRef;
import com.example.deal.dto.SteamDealRef;
import com.example.deal.fetcher.SteamMetaFetcher;
import com.example.deal.fetcher.SteamPriceFetcher;
import com.example.deal.fetcher.StoreFetcher;
import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;
import com.example.deal.fetcher.dto.SteamPrice;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 수집 오케스트레이션: fetch(raw) → normalize → upsert.
 * 저장 순서 store → game → deal (FK).
 * 여러 정렬(sort-list)로 수집해 인기 게임(Deal Rating)과 초고할인(Savings)을 함께 확보.
 * 이후 스팀 딜은 cc=kr 실제 원화로 보강(enrichSteamKrw).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DealService {

    private final StoreFetcher fetcher;              // CheapSharkFetcher
    private final SteamPriceFetcher steamPriceFetcher;
    private final SteamMetaFetcher steamMetaFetcher;
    private final Normalizer normalizer;
    private final DealMapper dealMapper;

    @Value("${cheapshark.collect.sort-list:Deal Rating,Savings}")
    private String[] sortList;

    @Value("${cheapshark.collect.max-pages:8}")
    private int maxPages;

    @Value("${cheapshark.collect.page-size:60}")
    private int pageSize;

    @Value("${steam.krw.enabled:true}")
    private boolean steamKrwEnabled;

    @Value("${steam.krw.max:130}")
    private int steamKrwMax;

    @Value("${steam.krw.throttle-ms:500}")
    private long steamKrwThrottleMs;

    @Value("${steam.meta.enabled:true}")
    private boolean steamMetaEnabled;

    @Value("${steam.meta.max:100}")
    private int steamMetaMax;

    @Value("${steam.meta.throttle-ms:1500}")
    private long steamMetaThrottleMs;

    /** 1회 수집(CheapShark). */
    @Transactional
    public CollectResult collectOnce() {
        long start = System.currentTimeMillis();

        List<CheapSharkStore> rawStores = fetcher.fetchStores();
        for (CheapSharkStore s : rawStores) {
            dealMapper.upsertStore(normalizer.toStore(s));
        }
        log.info("[수집] 스토어 {}건 upsert", rawStores.size());

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

    /**
     * 스팀 딜에 실제 한국 원화(cc=kr) 보강. 네트워크 호출이 많아 트랜잭션 없이
     * 각 건 개별 갱신(autocommit) + rate limit 배려로 호출 간 throttle.
     */
    public int enrichSteamKrw() {
        if (!steamKrwEnabled) {
            return 0;
        }
        List<SteamDealRef> refs = dealMapper.findSteamDealsForKrw(steamKrwMax);
        int updated = 0;
        for (SteamDealRef ref : refs) {
            SteamPrice p = steamPriceFetcher.fetchKrw(ref.getSteamAppId());
            if (p != null) {
                dealMapper.updateDealKrw(ref.getDealId(), p.krwSale(), p.krwNormal());
                updated++;
            }
            try {
                Thread.sleep(steamKrwThrottleMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        log.info("[스팀KRW] 대상 {}건 중 {}건 실가 갱신", refs.size(), updated);
        return updated;
    }

    /**
     * 스팀 메타(장르·한국어 소개) 보강. 게임당 1회 — meta_fetched_at 없는 게임만.
     * appdetails 는 rate limit(~200회/5분)이 빡빡해 KRW 보강보다 긴 스로틀 사용.
     * 일시 오류(null)는 마킹하지 않아 다음 사이클에 재시도, 내려간 앱(빈 메타)은 마킹해 종료.
     */
    public int enrichSteamMeta() {
        if (!steamMetaEnabled) {
            return 0;
        }
        List<GameMetaRef> refs = dealMapper.findGamesForMeta(steamMetaMax);
        int updated = 0;
        for (GameMetaRef ref : refs) {
            SteamMetaFetcher.SteamMeta m = steamMetaFetcher.fetchMeta(ref.getSteamAppId());
            if (m != null) {
                dealMapper.updateGameMeta(ref.getGameId(), m.genres(), m.shortDescKo());
                if (m.genres() != null) {
                    updated++;
                }
            }
            try {
                Thread.sleep(steamMetaThrottleMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        log.info("[스팀메타] 대상 {}건 중 {}건 장르 확보", refs.size(), updated);
        return updated;
    }

    public record CollectResult(int stores, int fetched, long totalDeals, long elapsedMs) {}
}
