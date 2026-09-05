insert into storage.buckets (id, name, public)
values ('brew-photos', 'brew-photos', false)
on conflict (id) do update set public = false;

create policy "내 기록 사진 읽기"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'brew-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "내 기록 사진 추가"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'brew-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "내 기록 사진 삭제"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'brew-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
