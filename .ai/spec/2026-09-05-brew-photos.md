# 기록 사진 저장 설계

- 날짜: 2026-09-05
- 상태: 대상 정정 및 구현 기준 확정
- 범위: 집·카페 기록(`Brew`)의 사진 3슬롯

## 목표

기록 하나에 일반 사진을 최대 3장 저장한다. 입력 순서를 보존하고, 삭제하면
뒤 사진을 앞으로 당긴다. 사진은 현재 기록 소유자만 볼 수 있으며, 커뮤니티
공개는 별도 기능으로 다룬다. 사진은 원두(`Bean`)가 아니라 기록(`Brew`)에
귀속된다.

## 데이터 모델

`public.brews`에 슬롯마다 썸네일·확대본 경로를 저장한다.

```text
photo_1_thumbnail_path  text nullable
photo_1_large_path      text nullable
photo_2_thumbnail_path  text nullable
photo_2_large_path      text nullable
photo_3_thumbnail_path  text nullable
photo_3_large_path      text nullable
```

같은 슬롯의 두 경로는 함께 채워지거나 함께 비어 있어야 한다. slot 2는 slot 1,
slot 3은 slot 2가 먼저 채워져야 한다. 기존 `brews.photos text[]` 컬럼은 기존
데이터 손실을 막기 위해 당장은 보존하지만, 새 기능의 정본으로 사용하지 않는다.
새 사진 경로의 정본은 위 6개 컬럼이다.

도메인 타입은 다음과 같다.

```ts
type BrewPhoto = {
  thumbnailPath: string;
  largePath: string;
};

type BrewPhotoView = BrewPhoto & {
  thumbnailUrl: string;
  largeUrl: string;
};
```

`BrewBase`는 사진이 없을 때도 `photos: []`를 갖는다. `Bean`에는 사진 필드를
추가하지 않는다.

## Storage와 접근 제어

비공개 `brew-photos` bucket을 사용한다. object path에는 논리 슬롯이 아니라
사진별 고유 ID를 넣는다.

```text
{userId}/brews/{brewId}/{photoId}/thumbnail.webp
{userId}/brews/{brewId}/{photoId}/large.webp
```

DB에는 경로만 저장한다. 서버의 `libs/storage.ts`만 bucket, 업로드, 삭제,
Signed URL 세부 사항을 알고, Storage 정책은 path 첫 segment가 현재 사용자와
같은 경우에만 `select`·`insert`·`delete`를 허용한다.

기록 액션은 인증·입력 검증·기록 소유권을 담당한다. 클라이언트가 제출한 기존
경로를 소유권 증거로 사용하지 않고, 현재 사용자 소유 기록에서 읽은 경로와
대조한다.

## 입력과 저장

첫 버전 입력은 JPEG·PNG·WebP, 파일당 최대 10MB, 기록당 최대 3장이다. HEIC는
거부한다. 브라우저에서 EXIF 방향을 픽셀에 반영한 뒤 원본 비율을 유지하고
확대하지 않으며, 긴 변 기준 400px 썸네일(WebP q75)과 2000px 확대본(WebP q80)을
만든다.

클라이언트는 변환된 두 WebP만 FormData Server Action으로 보낸다. 원본은
서버로 보내지 않는다. Server Action 요청 상한은 전역 4MB로 설정하고, 액션에서
파일 수·쌍·MIME·소유권을 다시 검증한다.

한 사진의 두 object 중 하나라도 실패하면 이미 생성된 object를 정리하고 실패를
반환한다. 여러 사진 작업도 모두 성공한 뒤 한 번에 DB 경로를 갱신한다. DB 갱신
전 실패는 새 파일 전체를 정리하고 기존 상태를 유지한다. 교체·삭제 후의 기존
파일 정리는 DB가 새 상태를 가리킨 뒤 수행하며, 정리 실패는 로그에 남기되
성공한 DB 변경을 되돌리지 않는다.

## 구현 경계

- DB/domain: `types/brew.ts`, `types/supabase.ts`, `libs/db/brew-mappers.ts`
- Storage: `libs/storage.ts`
- 인증·FormData·소유권·원자적 조율: `app/(main)/(private)/brews/actions.ts`
- 입력 UI·변환: `components/brews/`, `libs/brews/`
- 상세 Signed URL·gallery: `app/(main)/(private)/brews/[brewId]/page.tsx`,
  `components/brews/`

사진 기능은 원두 등록·수정 화면을 변경하지 않는다.
