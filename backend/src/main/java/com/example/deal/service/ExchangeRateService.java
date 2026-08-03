package com.example.deal.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * USD → KRW 환율 캐시. 무료 API(open.er-api.com, 키 불필요)에서 주기적으로 받아 메모리에 보관.
 * 주의: 이 값은 '대략 환산'용. 게임의 실제 지역 가격(스팀 원화 등)과는 다를 수 있음(결정 D2).
 */
@Slf4j
@Service
public class ExchangeRateService {

    private final RestClient rest;
    private final double fallbackRate;

    private volatile double usdToKrw;
    private volatile Instant updatedAt;

    public ExchangeRateService(
            @Value("${exchange.url:https://open.er-api.com/v6/latest/USD}") String url,
            @Value("${exchange.fallback-krw:1400}") double fallbackRate) {
        this.rest = RestClient.builder()
                .baseUrl(url)
                .defaultHeader(HttpHeaders.USER_AGENT, "DealMoa/1.0 (tjqhdud2580@gmail.com)")
                .build();
        this.fallbackRate = fallbackRate;
        this.usdToKrw = fallbackRate;
    }

    @PostConstruct
    public void init() {
        refresh();
    }

    /** 6시간마다 환율 갱신(앱 기동 6시간 뒤부터). 기동 직후 값은 @PostConstruct 로 확보. */
    @Scheduled(initialDelayString = "${exchange.refresh-ms:21600000}",
            fixedDelayString = "${exchange.refresh-ms:21600000}")
    public void refresh() {
        try {
            ErApiResponse resp = rest.get().retrieve().body(ErApiResponse.class);
            if (resp != null && resp.rates() != null && resp.rates().KRW() > 0) {
                this.usdToKrw = resp.rates().KRW();
                this.updatedAt = Instant.now();
                log.info("[환율] USD→KRW = {}", usdToKrw);
            } else {
                log.warn("[환율] 응답에 KRW 없음 — 기존값 유지({})", usdToKrw);
            }
        } catch (Exception e) {
            log.warn("[환율] 갱신 실패 — 기존값({}) 유지: {}", usdToKrw, e.getMessage());
        }
    }

    public double getUsdToKrw() {
        return usdToKrw;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public double getFallbackRate() {
        return fallbackRate;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ErApiResponse(Rates rates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Rates(double KRW) {}
}
