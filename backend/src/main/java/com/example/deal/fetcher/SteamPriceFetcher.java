package com.example.deal.fetcher;

import java.math.BigDecimal;
import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.example.deal.fetcher.dto.SteamPrice;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * 스팀 스토어의 실제 한국 원화(cc=kr) 가격 조회. (비공식 공개 API)
 * 스팀은 가격을 x100 정수로 준다(예: ₩34,800 → 3480000) → 100으로 나눔.
 * 응답이 게임마다 형태가 조금씩 달라(success=false 면 data 가 [] 등) JsonNode 로 방어적으로 파싱.
 */
@Slf4j
@Component
public class SteamPriceFetcher {

    private final RestClient rest;

    public SteamPriceFetcher() {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(Duration.ofSeconds(8));
        f.setReadTimeout(Duration.ofSeconds(12));
        this.rest = RestClient.builder()
                .baseUrl("https://store.steampowered.com/api")
                .requestFactory(f)
                .defaultHeader(HttpHeaders.USER_AGENT, "DealMoa/1.0 (tjqhdud2580@gmail.com)")
                .build();
    }

    /** 실제 KRW 가격(할인가, 정가). 못 구하면 null. */
    public SteamPrice fetchKrw(String steamAppId) {
        try {
            JsonNode root = rest.get()
                    .uri(u -> u.path("/appdetails")
                            .queryParam("appids", steamAppId)
                            .queryParam("cc", "kr")
                            .queryParam("filters", "price_overview")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
            if (root == null) {
                return null;
            }
            JsonNode detail = root.get(steamAppId);
            if (detail == null || !detail.path("success").asBoolean(false)) {
                return null;
            }
            JsonNode po = detail.path("data").path("price_overview");
            if (po.isMissingNode() || !"KRW".equals(po.path("currency").asText())) {
                return null;
            }
            long initial = po.path("initial").asLong(0);
            long finalPrice = po.path("final").asLong(0);
            if (initial <= 0) {
                return null;
            }
            return new SteamPrice(
                    BigDecimal.valueOf(finalPrice).movePointLeft(2),
                    BigDecimal.valueOf(initial).movePointLeft(2));
        } catch (Exception e) {
            log.debug("[스팀KRW] appid={} 실패: {}", steamAppId, e.getMessage());
            return null;
        }
    }
}
