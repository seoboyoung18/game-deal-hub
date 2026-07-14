package com.example.deal.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.deal.domain.Deal;
import com.example.deal.domain.Game;
import com.example.deal.domain.Store;
import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;

/**
 * CheapShark 원본(raw) → 도메인(공통 포맷) 변환.
 * 핵심 함정 처리: 가격 문자열 → BigDecimal, epoch 정수 → LocalDateTime(UTC).
 */
@Component
public class Normalizer {

    private static final String IMG_BASE = "https://www.cheapshark.com";

    public Store toStore(CheapSharkStore s) {
        String icon = (s.getImages() != null && StringUtils.hasText(s.getImages().getIcon()))
                ? IMG_BASE + s.getImages().getIcon()
                : null;
        return Store.builder()
                .storeId(s.getStoreID())
                .storeName(s.getStoreName())
                .active(s.getIsActive() != null && s.getIsActive() == 1)
                .iconUrl(icon)
                .build();
    }

    public Game toGame(CheapSharkDeal d) {
        return Game.builder()
                .gameId(d.getGameID())
                .title(d.getTitle())
                .steamAppId(StringUtils.hasText(d.getSteamAppID()) ? d.getSteamAppID() : null)
                .thumbUrl(d.getThumb())
                .metacriticScore(toIntOrNull(d.getMetacriticScore()))
                .steamRatingPct(toIntOrNull(d.getSteamRatingPercent()))
                .releaseDate(epochToLdt(d.getReleaseDate()))
                .build();
    }

    public Deal toDeal(CheapSharkDeal d) {
        return Deal.builder()
                .dealId(d.getDealID())
                .gameId(d.getGameID())
                .storeId(d.getStoreID())
                .salePrice(toMoney(d.getSalePrice()))
                .normalPrice(toMoney(d.getNormalPrice()))
                .savings(toPercent(d.getSavings()))
                .dealRating(toRating(d.getDealRating()))
                .currency("USD")
                .onSale("1".equals(d.getIsOnSale()))
                .lastChange(epochToLdt(d.getLastChange()))
                .build();
    }

    /** "7.49" → 7.49 (NUMERIC(10,2)). FLOAT 금지 — BigDecimal 로 파싱. */
    private BigDecimal toMoney(String s) {
        if (!StringUtils.hasText(s)) {
            return BigDecimal.ZERO.setScale(2);
        }
        return new BigDecimal(s.trim()).setScale(2, RoundingMode.HALF_UP);
    }

    /** "62.531266" → 62.53 (NUMERIC(5,2)). */
    private BigDecimal toPercent(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return new BigDecimal(s.trim()).setScale(2, RoundingMode.HALF_UP);
    }

    /** "10.0" → 10.0 (NUMERIC(4,1)). CheapShark 추천 점수. */
    private BigDecimal toRating(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return new BigDecimal(s.trim()).setScale(1, RoundingMode.HALF_UP);
    }

    private Integer toIntOrNull(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        try {
            return Integer.valueOf(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** epoch seconds → LocalDateTime(UTC). 0/음수/null 은 null 로 처리. */
    private LocalDateTime epochToLdt(Long epochSeconds) {
        if (epochSeconds == null || epochSeconds <= 0) {
            return null;
        }
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }
}
