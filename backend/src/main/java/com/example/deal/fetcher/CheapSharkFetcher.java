package com.example.deal.fetcher;

import java.time.Duration;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;

import lombok.extern.slf4j.Slf4j;

/**
 * CheapShark API 수집기. API 키 불필요.
 * 주의: CheapShark 는 서술적 User-Agent 헤더를 요구한다(없으면 요청 거부).
 */
@Slf4j
@Component
public class CheapSharkFetcher implements StoreFetcher {

    /** CheapShark 정책상 필수. 연락처 포함한 식별 가능한 값. */
    private static final String USER_AGENT = "DealMoa/1.0 (tjqhdud2580@gmail.com)";

    private final RestClient restClient;

    public CheapSharkFetcher(@Value("${cheapshark.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(20));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
                .build();
    }

    @Override
    public String sourceName() {
        return "CheapShark";
    }

    @Override
    public List<CheapSharkStore> fetchStores() {
        List<CheapSharkStore> stores = restClient.get()
                .uri("/stores")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CheapSharkStore>>() {});
        log.debug("[CheapShark] /stores {}건 수신", stores == null ? 0 : stores.size());
        return stores == null ? List.of() : stores;
    }

    @Override
    public List<CheapSharkDeal> fetchDeals(int pageNumber, int pageSize) {
        List<CheapSharkDeal> deals = restClient.get()
                .uri(uri -> uri.path("/deals")
                        .queryParam("pageNumber", pageNumber)
                        .queryParam("pageSize", pageSize)
                        .queryParam("sortBy", "Savings")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<CheapSharkDeal>>() {});
        log.debug("[CheapShark] /deals page={} {}건 수신", pageNumber, deals == null ? 0 : deals.size());
        return deals == null ? List.of() : deals;
    }
}
