package com.example.deal.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.deal.service.ExchangeRateService;

import lombok.RequiredArgsConstructor;

/**
 * 환율 조회. 프론트가 KRW 표시 시 이 값으로 대략 환산.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService rateService;

    @GetMapping("/exchange-rate")
    public Map<String, Object> exchangeRate() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("base", "USD");
        body.put("target", "KRW");
        body.put("rate", rateService.getUsdToKrw());
        body.put("updatedAt", String.valueOf(rateService.getUpdatedAt()));
        body.put("approximate", true); // 환율 환산값(실제 결제가와 다를 수 있음)
        return body;
    }
}
