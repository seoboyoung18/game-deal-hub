-- ============================================================
--  게임 할인 집계 서비스 - 초기 스키마
--  Flyway: src/main/resources/db/migration/V1__init_schema.sql
--  PostgreSQL 16+ (DB는 UTF8 인코딩으로 생성 — Postgres 기본값)
-- ============================================================

-- 1) 스토어  (CheapShark /stores 응답 기반)
CREATE TABLE stores (
    store_id    VARCHAR(20)   NOT NULL,                 -- CheapShark storeID ("1" = Steam)
    store_name  VARCHAR(100)  NOT NULL,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,    -- 문 닫은 스토어 걸러내기용
    icon_url    VARCHAR(500),
    PRIMARY KEY (store_id)
);

-- 2) 게임  (스토어를 넘어 "같은 게임"을 묶는 단위)
CREATE TABLE games (
    game_id           VARCHAR(20)   NOT NULL,           -- CheapShark gameID - 스토어 달라도 같은 게임이면 동일
    title             VARCHAR(500)  NOT NULL,
    steam_app_id      VARCHAR(20),                      -- 스팀에 없는 게임도 있어서 nullable
    thumb_url         VARCHAR(500),
    metacritic_score  INTEGER,
    steam_rating_pct  INTEGER,                          -- 스팀 긍정 리뷰 %
    release_date      TIMESTAMP,                        -- epoch 정수 -> TIMESTAMP 변환해서 저장
    PRIMARY KEY (game_id)
);

-- 3) 딜  (게임 x 스토어 x 가격 = 할인 정보 한 건)
CREATE TABLE deals (
    deal_id       VARCHAR(100)   NOT NULL,              -- CheapShark dealID
    game_id       VARCHAR(20)    NOT NULL,
    store_id      VARCHAR(20)    NOT NULL,
    sale_price    NUMERIC(10,2)  NOT NULL,              -- 문자열 "7.49" -> NUMERIC 파싱 (KRW 큰 값도 수용)
    normal_price  NUMERIC(10,2)  NOT NULL,
    savings       NUMERIC(5,2),                         -- 할인율 %, 예: 62.53
    currency      CHAR(3)        NOT NULL DEFAULT 'USD',-- 지금은 전부 USD, 나중에 KRW 행 추가
    is_on_sale    BOOLEAN        NOT NULL DEFAULT TRUE,
    last_change   TIMESTAMP,                            -- epoch 정수 -> TIMESTAMP 변환
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (deal_id),
    CONSTRAINT fk_deals_game  FOREIGN KEY (game_id)  REFERENCES games(game_id),
    CONSTRAINT fk_deals_store FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- updated_at 자동 갱신
--   Postgres 엔 MySQL 의 ON UPDATE CURRENT_TIMESTAMP 가 없어서 트리거로 구현
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_set_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 조회 패턴용 인덱스
--   MySQL(InnoDB) 과 달리 Postgres 는 FK 컬럼에 인덱스를 자동 생성하지 않음 -> 직접 추가
CREATE INDEX idx_deals_game       ON deals (game_id);
CREATE INDEX idx_deals_store      ON deals (store_id);
CREATE INDEX idx_deals_savings    ON deals (savings);     -- "할인율 높은 순" 메인 정렬
CREATE INDEX idx_deals_sale_price ON deals (sale_price);  -- 가격대 필터
