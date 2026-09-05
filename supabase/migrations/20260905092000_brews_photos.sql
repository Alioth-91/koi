-- 이전 구현에서 잘못 추가된 원두 사진 컬럼을 제거한다.
alter table public.beans
  drop constraint if exists beans_photo_1_pair_check,
  drop constraint if exists beans_photo_2_pair_check,
  drop constraint if exists beans_photo_3_pair_check,
  drop constraint if exists beans_photo_2_order_check,
  drop constraint if exists beans_photo_3_order_check,
  drop column if exists photo_1_thumbnail_path,
  drop column if exists photo_1_large_path,
  drop column if exists photo_2_thumbnail_path,
  drop column if exists photo_2_large_path,
  drop column if exists photo_3_thumbnail_path,
  drop column if exists photo_3_large_path;

alter table public.brews
  add column photo_1_thumbnail_path text,
  add column photo_1_large_path text,
  add column photo_2_thumbnail_path text,
  add column photo_2_large_path text,
  add column photo_3_thumbnail_path text,
  add column photo_3_large_path text,
  add constraint brews_photo_1_pair_check check (
    (photo_1_thumbnail_path is null) = (photo_1_large_path is null)
  ),
  add constraint brews_photo_2_pair_check check (
    (photo_2_thumbnail_path is null) = (photo_2_large_path is null)
  ),
  add constraint brews_photo_3_pair_check check (
    (photo_3_thumbnail_path is null) = (photo_3_large_path is null)
  ),
  add constraint brews_photo_2_order_check check (
    photo_2_thumbnail_path is null or photo_1_thumbnail_path is not null
  ),
  add constraint brews_photo_3_order_check check (
    photo_3_thumbnail_path is null or photo_2_thumbnail_path is not null
  );
