-- ============================================================
--  V4: 게임 스팀 메타 (장르·한국어 소개문)
--  스팀 appdetails(l=korean)는 이름은 영어지만 장르·설명은 한국어로 준다.
--  meta_fetched_at: 보강 시도 완료 마커 — 없는 게임만 골라 배치 보강,
--                   스팀에서 내려간 앱(success=false)도 마킹해 무한 재시도 방지.
-- ============================================================

ALTER TABLE games
    ADD COLUMN genres          VARCHAR(300),   -- 한국어 장르, '|' 구분 (예: 액션|인디|RPG)
    ADD COLUMN short_desc_ko   TEXT,           -- 한국어 짧은 소개문
    ADD COLUMN meta_fetched_at TIMESTAMP;      -- 보강 시도 시각 (NULL = 아직 안 함)
