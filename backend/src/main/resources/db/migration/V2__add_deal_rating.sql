-- 추천순 정렬용: CheapShark dealRating(품질·가성비 점수) 저장
-- (V1 은 이미 적용됨 → 변경분은 새 마이그레이션 V2 로 추가)
ALTER TABLE deals ADD COLUMN deal_rating NUMERIC(4,1);

-- "추천순" 정렬 인덱스
CREATE INDEX idx_deals_rating ON deals (deal_rating);
