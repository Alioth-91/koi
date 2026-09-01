/**
 * 원두
 */
export type Bean = {
  id: string;
  name: string;
  roastery?: string;
  roastedAt?: string; // YYYY-MM-DD. brew의 date와 같은 문자열이다
  weight?: number; // 봉지 용량(g)
  price?: number; // 봉지 값(원)
  process?: string; // 가공 방식
  roastLevel?: string; // 로스팅 포인트

  // 소진은 삭제가 아니라 보관 상태 전환이다
  archived?: boolean;
};
