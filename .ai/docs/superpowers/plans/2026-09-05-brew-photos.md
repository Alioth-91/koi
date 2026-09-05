# Brew Photos Implementation Plan

> 승인된 기록 사진 구현 계획이다. migration 실행·커밋·push는 별도 승인 없이
> 수행하지 않는다.

## 현재 완료

- [x] `BrewPhoto`, `BrewPhotoView`, `Brew.photos` 추가
- [x] `brews` 사진 6개 nullable 컬럼과 pair/order 제약 migration 작성
- [x] `libs/db/brew-mappers.ts`의 순서 보존·nullable 변환 구현
- [x] `brew-photos` private Storage adapter와 사용자 prefix RLS migration 작성
- [x] 업로드 pair 원자적 정리·삭제·Signed URL 테스트 작성

## 다음 작업

### 1. Server Action 전송·DB 조율

- `next.config.ts`에 전역 `experimental.serverActions.bodySizeLimit: "4mb"` 추가
- `libs/schemas/brew-photo.ts`에서 untrusted FormData의 기존/신규 사진 entry 검증
- `libs/db/brews.ts`에서 insert ID 반환과 사진 경로 update 경계 추가
- `app/(main)/(private)/brews/actions.ts`를 FormData 기반으로 확장
- 인증, 기록 소유권, 기존 path 대조, 다중 업로드 실패 시 새 object 전체 정리를 검증

### 2. 브라우저 사진 처리

- `libs/brews/photo-processing.ts`에서 JPEG·PNG·WebP, 10MB, 최대 3장 검증
- `createImageBitmap(file, { imageOrientation: "from-image" })`로 EXIF 방향 보정
- 400px/2000px WebP 변환과 비확대·비율 보존 테스트

### 3. 기록 폼 연결

- `libs/brews/photo-form-data.ts`에서 slot 순서와 `photo:{clientId}:thumbnail/large`
  FormData key 생성
- `components/brews/brew-photo-input.tsx`에서 선택·미리보기·교체·삭제·재시도 상태 관리
- `new-brew-form.tsx`, 집·카페 폼에서 사진 draft를 action에 포함
- 저장 중 중복 제출·닫기 방지

### 4. 상세 화면

- `brews/[brewId]/page.tsx`에서 서버 Signed URL 생성
- `brew-photo-gallery.tsx`에서 썸네일 우선 표시, 클릭한 확대본만 로드
- 삭제·교체 시 compact된 순서와 Storage 정리 대상을 검증

### 5. 최종 검증

- 모바일·데스크톱 기록 등록/수정/상세 흐름 확인
- `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`
- 두 사용자 간 기록 사진 접근 차단은 migration 적용 후 Supabase 환경에서 별도 확인
