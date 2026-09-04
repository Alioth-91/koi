alter table public.beans
  add column photo_1_thumbnail_path text,
  add column photo_1_large_path text,
  add column photo_2_thumbnail_path text,
  add column photo_2_large_path text,
  add column photo_3_thumbnail_path text,
  add column photo_3_large_path text,
  add constraint beans_photo_1_pair_check check (
    (photo_1_thumbnail_path is null) = (photo_1_large_path is null)
  ),
  add constraint beans_photo_2_pair_check check (
    (photo_2_thumbnail_path is null) = (photo_2_large_path is null)
  ),
  add constraint beans_photo_3_pair_check check (
    (photo_3_thumbnail_path is null) = (photo_3_large_path is null)
  ),
  add constraint beans_photo_2_order_check check (
    photo_2_thumbnail_path is null or photo_1_thumbnail_path is not null
  ),
  add constraint beans_photo_3_order_check check (
    photo_3_thumbnail_path is null or photo_2_thumbnail_path is not null
  );
