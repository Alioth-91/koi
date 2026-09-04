-- 기록 당시 원두 가격·구매 용량을 보존한다.
-- 기존 기록은 과거 값을 알 수 없으므로 NULL로 둔다.
alter table public.brews
  add column bean_price integer,
  add column bean_weight numeric;
