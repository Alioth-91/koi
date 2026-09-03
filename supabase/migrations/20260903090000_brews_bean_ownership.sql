-- 집 기록은 같은 사용자가 소유한 원두만 연결할 수 있어야 한다.
-- Server Action의 재조회와 별개로 DB에서도 소유권을 검사한다.
alter policy "내 기록 추가" on public.brews
  with check (
    auth.uid() = user_id
    and (
      bean_id is null
      or exists (
        select 1
        from public.beans as selected_bean
        where selected_bean.id = brews.bean_id
          and selected_bean.user_id = auth.uid()
      )
    )
  );
