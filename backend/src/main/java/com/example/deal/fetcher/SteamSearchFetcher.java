package com.example.deal.fetcher;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * 스팀 스토어 검색(storesearch) — 한글 검색어 → appid 목록. (비공식 공개 API)
 * 우리 DB 제목은 영어뿐이라 '사이버펑크' 같은 한글 질의는 스팀 한국어 검색으로
 * appid 를 받아 games.steam_app_id 와 매칭한다. 검색 시에만 호출(그 질의 한정).
 */
@Slf4j
@Component
public class SteamSearchFetcher {

    private final RestClient rest;

    public SteamSearchFetcher() {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(Duration.ofSeconds(5));
        f.setReadTimeout(Duration.ofSeconds(8));
        this.rest = RestClient.builder()
                .baseUrl("https://store.steampowered.com/api")
                .requestFactory(f)
                .defaultHeader(HttpHeaders.USER_AGENT, "DealMoa/1.0 (tjqhdud2580@gmail.com)")
                .build();
    }

    /** 한국어 스토어 검색 결과의 appid 목록(관련도순, 최대 ~10건). 실패하면 빈 목록. */
    public List<String> searchAppIds(String term) {
        try {
            JsonNode root = rest.get()
                    .uri(u -> u.path("/storesearch/")
                            .queryParam("term", term)
                            .queryParam("cc", "KR")
                            .queryParam("l", "koreana")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
            List<String> ids = new ArrayList<>();
            if (root != null && root.path("items").isArray()) {
                for (JsonNode item : root.path("items")) {
                    long id = item.path("id").asLong(0);
                    if (id > 0) {
                        ids.add(String.valueOf(id));
                    }
                }
            }
            return ids;
        } catch (Exception e) {
            log.debug("[스팀검색] term={} 실패: {}", term, e.getMessage());
            return List.of();
        }
    }
}
