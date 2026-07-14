package com.example.deal.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.deal.dto.DealResponse;
import com.example.deal.dto.PageResponse;
import com.example.deal.dto.StoreDto;
import com.example.deal.repository.DealMapper;

import lombok.RequiredArgsConstructor;

/**
 * 조회 REST API. 사용자 요청은 DB 에서만 응답(외부 API 직접 호출 없음, D7).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DealController {

    private final DealMapper dealMapper;

    /** 할인 목록 (정렬 savings/price · 스토어/가격 필터 · 페이징). */
    @GetMapping("/deals")
    public PageResponse<DealResponse> getDeals(
            @RequestParam(defaultValue = "rating") String sort,
            @RequestParam(required = false) String storeId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int p = Math.max(page, 0);
        int s = Math.min(Math.max(size, 1), 100);
        int offset = p * s;

        List<DealResponse> content = dealMapper.findDeals(sort, storeId, minPrice, maxPrice, offset, s);
        long total = dealMapper.countDealsFiltered(storeId, minPrice, maxPrice);
        return PageResponse.of(content, p, s, total);
    }

    /** 활성 스토어 목록 (필터 UI 구성용). */
    @GetMapping("/stores")
    public List<StoreDto> getStores() {
        return dealMapper.findActiveStores();
    }
}
