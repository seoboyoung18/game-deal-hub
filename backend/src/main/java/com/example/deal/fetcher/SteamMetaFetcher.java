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
 * 스팀 appdetails 로 게임 메타(장르·짧은 소개문) 조회. (비공식 공개 API)
 * l=korean 이면 name 은 영어 그대로지만 genres[].description 과 short_description 은 한국어로 온다.
 * 반환 규약:
 *  - null           → 네트워크/파싱 등 일시 오류 (다음 사이클에 재시도)
 *  - SteamMeta      → 시도 완료. success=false(스팀에서 내려간 앱)면 필드가 null 인 빈 메타
 */
@Slf4j
@Component
public class SteamMetaFetcher {

    /**
     * genres: '|' 구분 한국어 장르 · koreanSupport: 'voice'(음성까지)/'sub'(자막)/null.
     * 전부 null 일 수 있음(내려간 앱 등).
     */
    public record SteamMeta(String genres, String shortDescKo, String koreanSupport) {}

    private final RestClient rest;

    public SteamMetaFetcher() {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(Duration.ofSeconds(8));
        f.setReadTimeout(Duration.ofSeconds(12));
        this.rest = RestClient.builder()
                .baseUrl("https://store.steampowered.com/api")
                .requestFactory(f)
                .defaultHeader(HttpHeaders.USER_AGENT, "DealMoa/1.0 (tjqhdud2580@gmail.com)")
                .build();
    }

    public SteamMeta fetchMeta(String steamAppId) {
        try {
            JsonNode root = rest.get()
                    .uri(u -> u.path("/appdetails")
                            .queryParam("appids", steamAppId)
                            .queryParam("cc", "kr")
                            .queryParam("l", "korean")
                            .queryParam("filters", "basic,genres")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
            if (root == null) {
                return null;
            }
            JsonNode detail = root.get(steamAppId);
            if (detail == null) {
                return null;
            }
            if (!detail.path("success").asBoolean(false)) {
                // 스팀에서 내려갔거나 지역 제한 — 완료로 마킹해 재시도 안 함
                return new SteamMeta(null, null, null);
            }
            JsonNode data = detail.path("data");

            String genres = null;
            JsonNode genresNode = data.path("genres");
            if (genresNode.isArray() && genresNode.size() > 0) {
                List<String> names = new ArrayList<>();
                for (JsonNode g : genresNode) {
                    String desc = g.path("description").asText("").trim();
                    if (!desc.isEmpty() && !names.contains(desc)) {
                        names.add(desc);
                    }
                }
                if (!names.isEmpty()) {
                    genres = String.join("|", names);
                    if (genres.length() > 300) { // VARCHAR(300) 방어
                        genres = genres.substring(0, 300);
                    }
                }
            }

            String shortDesc = data.path("short_description").asText("").trim();
            return new SteamMeta(genres, shortDesc.isEmpty() ? null : shortDesc,
                    parseKoreanSupport(data.path("supported_languages").asText("")));
        } catch (Exception e) {
            log.debug("[스팀메타] appid={} 실패: {}", steamAppId, e.getMessage());
            return null;
        }
    }

    /**
     * supported_languages(HTML 문자열)에서 한국어 지원 파싱.
     * 예: "English, Korean<strong>*</strong>, Japanese" — <strong>*</strong> 는 음성(full audio) 지원.
     * l=korean 요청이라 언어명이 "한국어" 로 올 수도 있어 둘 다 확인.
     */
    private String parseKoreanSupport(String languagesHtml) {
        if (languagesHtml == null || languagesHtml.isEmpty()) {
            return null;
        }
        boolean hasKorean = languagesHtml.contains("Korean") || languagesHtml.contains("한국어");
        if (!hasKorean) {
            return null;
        }
        boolean voice = languagesHtml.contains("Korean<strong>*</strong>")
                || languagesHtml.contains("한국어<strong>*</strong>");
        return voice ? "voice" : "sub";
    }
}
