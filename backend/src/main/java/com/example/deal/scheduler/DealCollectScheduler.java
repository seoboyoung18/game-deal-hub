package com.example.deal.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.deal.service.DealService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * @Scheduled 수집 잡. 외부 API 는 이 주기에만 호출한다(NFR-03).
 * 장애 격리: 예외를 잡아 로깅만 하고 다음 주기를 보장한다(WBS 1.8).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DealCollectScheduler {

    private final DealService dealService;

    @Value("${cheapshark.collect.enabled:true}")
    private boolean enabled;

    @Scheduled(
            initialDelayString = "${cheapshark.collect.initial-delay-ms:5000}",
            fixedDelayString = "${cheapshark.collect.fixed-delay-ms:21600000}")
    public void scheduledCollect() {
        if (!enabled) {
            log.info("[스케줄러] 수집 비활성화 — 건너뜀");
            return;
        }
        try {
            log.info("[스케줄러] 수집 시작");
            DealService.CollectResult r = dealService.collectOnce();
            log.info("[스케줄러] 수집 성공 — 스토어 {} · 저장 딜 {} · {}ms", r.stores(), r.totalDeals(), r.elapsedMs());
        } catch (Exception e) {
            log.error("[스케줄러] 수집 실패 — 다음 주기에 재시도합니다: {}", e.getMessage(), e);
        }
    }
}
