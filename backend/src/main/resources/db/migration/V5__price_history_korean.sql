-- ============================================================
-- V5: 가격 이력(역대 최저가 원천) + 한국어 지원 표시
-- ============================================================

-- 1) 가격 이력: 수집 사이클마다 (게임×스토어) 판매가가 직전 기록과 다를 때만 적재.
--    역대 최저가·가격 그래프(스파크라인)의 원천. 수집 시작 시점부터 쌓인다.
CREATE TABLE price_history (
    id           BIGSERIAL     NOT NULL,
    game_id      VARCHAR(20)   NOT NULL,
    store_id     VARCHAR(20)   NOT NULL,
    sale_price   NUMERIC(10,2) NOT NULL,
    recorded_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ph_game  FOREIGN KEY (game_id)  REFERENCES games(game_id),
    CONSTRAINT fk_ph_store FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

CREATE INDEX idx_ph_game_time ON price_history (game_id, recorded_at DESC);

-- 2) 한국어 지원 (스팀 supported_languages): 'voice'(음성까지) | 'sub'(자막) | NULL(미지원/미확인)
ALTER TABLE games ADD COLUMN korean_support VARCHAR(10);

-- 기존 보강분에도 korean_support 를 채우도록 메타 재수집 유도 (사이클당 100건씩 자동)
UPDATE games SET meta_fetched_at = NULL;
