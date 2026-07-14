package com.example.deal.fetcher;

import java.util.List;

import com.example.deal.fetcher.dto.CheapSharkDeal;
import com.example.deal.fetcher.dto.CheapSharkStore;

/**
 * 스토어별 수집기 공통 인터페이스.
 * 각 소스(CheapShark, 향후 Steam/Epic/GOG)마다 구현체를 두어 장애를 격리한다.
 * 반환값은 소스 원본(raw). 공통 포맷 변환은 {@code Normalizer} 가 담당한다.
 */
public interface StoreFetcher {

    /** 소스 식별용 이름(로깅). */
    String sourceName();

    /** 스토어 목록 원본. */
    List<CheapSharkStore> fetchStores();

    /** 할인 목록 원본(페이지 단위, 0-base). sortBy 는 CheapShark 정렬(예: "Deal Rating", "Savings"). */
    List<CheapSharkDeal> fetchDeals(int pageNumber, int pageSize, String sortBy);
}
