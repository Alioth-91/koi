import { Bean } from "@/types/bean";

/**
 * 진짜 데이터가 붙으면 이 파일은 지운다.
 *
 * 이름을 mocks/brews.ts의 beanName과 일부러 맞춰뒀다.
 * 아직 기록이 원두를 id로 가리키지 않아서, "이 원두로 만든 기록"은
 * 지금은 이름으로만 이어붙일 수 있다.
 */
export const beans: Bean[] = [
  {
    // 아직 한 번도 안 내린 원두 — 기록 0건, 평균 없음, 잔량은 산 그대로
    id: "10",
    name: "엘살바도르 산타아나",
    roastery: "펠트 커피",
    roastedAt: "2026-08-26", // D+02
    weight: 200,
    price: 21000,
    process: "무산소",
    roastLevel: "미디엄 라이트",
  },
  {
    id: "1",
    name: "에티오피아 예가체프",
    roastery: "프릳츠",
    roastedAt: "2026-08-24", // 오늘(08-28) 기준 D+4 — 갓 볶은 축
    weight: 200,
    price: 18000,
    process: "워시드",
    roastLevel: "라이트",
  },
  {
    id: "2",
    name: "콜롬비아 수프리모",
    roastery: "커피리브레",
    roastedAt: "2026-08-18",
    weight: 200,
    price: 15000,
    process: "워시드",
    roastLevel: "미디엄",
  },
  {
    id: "3",
    name: "케냐 AA",
    roastery: "앤트러사이트",
    roastedAt: "2026-08-11",
    weight: 250,
    price: 24000,
    process: "무산소",
    roastLevel: "다크",
  },
  {
    // 이름만 있는 원두 — 상세에서 파생값이 통째로 빈다
    id: "4",
    name: "블렌드 하우스",
  },
  {
    id: "5",
    name: "과테말라 안티구아",
    roastery: "테라로사",
    roastedAt: "2026-08-02",
    weight: 500,
    price: 26000,
    process: "허니",
    roastLevel: "미디엄 다크",
  },
  {
    // 볶은 날짜가 없어 D+n을 못 구한다. 무게·가격은 있어서 g당 가격은 나온다
    id: "6",
    name: "브라질 산토스",
    weight: 1000,
    price: 22000,
  },
  {
    id: "7",
    name: "인도네시아 만델링",
    roastery: "펠트 커피",
    roastedAt: "2026-07-21", // D+38 — 한참 지난 축
    weight: 200,
    price: 17000,
    process: "웻훌",
  },
  {
    id: "8",
    name: "코스타리카 타라주",
    roastery: "프릳츠",
    roastedAt: "2026-07-15",
    weight: 200,
    price: 19000,
    process: "내추럴",
    archived: true,
  },
  {
    // 소진했지만 기록은 남아 있는 원두 (명세 4장: 지난 기록의 원두 이름은 유지된다)
    id: "9",
    name: "르완다 키부",
    roastery: "커피리브레",
    roastedAt: "2026-07-10",
    weight: 200,
    price: 16000,
    process: "워시드",
    archived: true,
  },
];
