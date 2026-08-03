-- 스팀 실제 원화(cc=kr) 저장용. 스팀 딜만 채워지고 나머지는 NULL(프론트에서 환율 환산).
ALTER TABLE deals ADD COLUMN krw_sale_price   NUMERIC(12,2);
ALTER TABLE deals ADD COLUMN krw_normal_price NUMERIC(12,2);
