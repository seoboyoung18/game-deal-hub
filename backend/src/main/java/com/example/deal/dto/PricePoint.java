package com.example.deal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

/** 가격 이력 한 점 — 일 단위 최저가(USD). GameDetailResponse.priceHistory 로 서빙. */
@Data
public class PricePoint {

    private LocalDate day;
    private BigDecimal price;
}
