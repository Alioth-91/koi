-- koi 초기 스키마 (2026-08-30)
--
-- Supabase SQL Editor 에서 실제로 실행해 통과한 SQL 이다.
-- 설계 근거는 .claude/records/2026-08-30.md, 관계도는 README.md.
--
-- 계정은 Supabase Auth 가 관리한다 (auth.users · auth.identities).
-- 명세 7장의 "(provider, provider_uid) 가 유일 키" 와 "다른 provider 로 오면 연결" 을
-- Auth 가 이미 하므로 여기서는 참조만 하고 직접 만들지 않는다.
--
-- 프로젝트에 automatic RLS 가 켜져 있어 표를 만들면 잠금이 자동으로 걸린다.
-- 그래도 enable row level security 를 적어두는 건, 이 파일만 보고도
-- 잠겨 있다는 걸 알 수 있게 하기 위해서다.


-- ─────────────────────────────────────────────────────────────
-- profiles — auth.users 와 1:1. 공개해도 되는 값만 담는다.
--   auth.users 에는 이메일이 있어 다른 사용자에게 노출할 수 없다.
--   커뮤니티 카드의 작성자 이름이 여기서 나온다.
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 지금은 본인 것만. 남의 프로필을 읽는 화면이 아직 없다.
-- 커뮤니티를 만들 때 select 를 authenticated 전체로 넓힌다.
create policy "본인 프로필 읽기" on public.profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

-- 가입하면 프로필 한 줄을 자동으로 만든다.
-- security definer — 가입 시점엔 아직 로그인 상태가 아니라 RLS 를 통과할 수 없다.
-- set search_path = '' — 그 강한 권한이 엉뚱한 스키마를 가리키지 않게 막는다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- beans — 원두
--   파생값(D+n · g당 가격 · 한 잔 원가 · 소진 예상일 · 잔량)은 저장하지 않는다.
--   weight 와 price 는 없을 수 있다 — 선물 · 나눔 · 소분
-- ─────────────────────────────────────────────────────────────
create table public.beans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- not null 은 빈 문자열을 막지 못한다. 폼에서 "" 가 그대로 올 수 있다.
  name        text not null check (length(trim(name)) > 0),
  -- 동명 원두를 구분하는 값. 없으면 두 봉지의 기록이 조용히 섞인다.
  roastery    text,
  roasted_at  date,
  weight      numeric,   -- 봉지 용량이지 남은 양이 아니다
  price       integer,
  process     text,      -- 로스터리마다 표기가 달라 자유 입력
  roast_level text,
  -- 소진은 삭제가 아니라 보관 상태 전환이다
  -- 사용자가 누르는 값이다 — 잔량으로 자동 판정하지 않는다.
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 조회는 늘 "내 것만" 이라 이 칸이 항상 조건에 들어간다.
create index beans_user_id_idx on public.beans (user_id);

alter table public.beans enable row level security;

create policy "내 원두 읽기" on public.beans
  for select using (auth.uid() = user_id);

create policy "내 원두 추가" on public.beans
  for insert with check (auth.uid() = user_id);

-- update 에 with check 가 없으면 user_id 를 남의 것으로 바꿔 떠넘길 수 있다.
create policy "내 원두 수정" on public.beans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "내 원두 삭제" on public.beans
  for delete using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- brews — 기록. 집과 카페를 한 표에 담는다.
--   나누면 커뮤니티의 댓글 · 좋아요가 어느 표를 가리키는지
--   데이터베이스가 검사할 수 없다.
-- ─────────────────────────────────────────────────────────────
create table public.brews (
  -- 공통
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null check (type in ('home', 'cafe')),
  date             date not null,   -- 사용자가 고른 달력 날짜. created_at 과 다르다
  -- 0 은 "정말 맛없었다" 이자 "안 골랐다". 슬라이더로는 둘을 나눌 수 없다.
  -- 목록 · 통계에 쓰이는 유일한 점수다 (명세 3.2).
  score            numeric(2,1) not null
                     check (score in (0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5)),
  memo             text,
  -- 최대 3장. 배열 순서가 곧 명세의 sort 0-2 이고 첫 장이 대표 사진이다.
  -- 빈 배열의 array_length 는 0 이 아니라 null 이라 is null 검사가 필요하다.
  photos           text[] not null default '{}'
                     check (array_length(photos, 1) is null
                            or array_length(photos, 1) <= 3),
  is_public        boolean not null default false,   -- 공개는 기록 단위 (명세 8장)
  created_at       timestamptz not null default now(),

  -- 맛 5축 — 평가가 아니라 체감이다. 0 은 "안 골랐다" 이자 "안 느껴졌다".
  -- 조합을 막지 않는다. 전부 5여도 저장된다.
  acidity          smallint not null default 0 check (acidity    between 0 and 5),
  sweetness        smallint not null default 0 check (sweetness  between 0 and 5),
  bitterness       smallint not null default 0 check (bitterness between 0 and 5),
  body             smallint not null default 0 check (body       between 0 and 5),
  aftertaste       smallint not null default 0 check (aftertaste between 0 and 5),

  -- 집에서만
  -- 원두를 지우면 bean_id 만 비고 bean_name 은 남는다 —
  -- "소진해도 지난 기록의 원두 이름은 유지된다" (명세 4장).
  bean_id          uuid references public.beans(id) on delete set null,
  bean_name        text,      -- 저장 시점의 이름을 그대로 박는다
  dose             numeric,   -- g
  water            numeric,   -- ml
  water_temp       smallint,  -- 섭씨. 카페의 temperature(hot/iced) 와 다른 값
  method           text,
  duration_seconds integer,   -- 타이머 경과. mm:ss 로 그리는 건 화면이 한다

  -- 카페에서만
  cafe_name        text,
  menu             text,
  price            integer,
  address          text,
  lat              numeric,
  lng              numeric,
  temperature      text check (temperature in ('hot', 'iced')),

  -- 유형별 필수 칸. 이름을 붙여야 어겼을 때 에러에 이 이름이 뜬다.
  constraint brews_type_fields check (
    (type = 'home' and bean_name is not null and cafe_name is null) or
    (type = 'cafe' and cafe_name is not null and bean_name is null)
  )
);

create index brews_user_date_idx on public.brews (user_id, date desc);
create index brews_bean_id_idx   on public.brews (bean_id);

alter table public.brews enable row level security;

create policy "내 기록 읽기" on public.brews
  for select using (auth.uid() = user_id);

create policy "내 기록 추가" on public.brews
  for insert with check (auth.uid() = user_id);

create policy "내 기록 수정" on public.brews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "내 기록 삭제" on public.brews
  for delete using (auth.uid() = user_id);
