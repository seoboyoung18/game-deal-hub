package com.example.deal.fetcher.dto;

import java.math.BigDecimal;

/** 스팀 cc=kr 실제 원화 가격 (할인가, 정가). */
public record SteamPrice(BigDecimal krwSale, BigDecimal krwNormal) {}
