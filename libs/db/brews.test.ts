import { describe, expect, it } from "vitest";

import {
  toBrew,
  toBrewInsert,
  toBrewUpdate,
  type ResolvedBrewForm,
} from "@/libs/db/brew-mappers";
import type { Database } from "@/types/supabase";

type BrewRow = Database["public"]["Tables"]["brews"]["Row"];

const baseRow: BrewRow = {
  acidity: 4,
  address: null,
  aftertaste: 3,
  bean_id: "bean-1",
  bean_name: "예가체프",
  bean_price: 18000,
  bean_weight: 200,
  bitterness: 2,
  body: 3,
  cafe_name: null,
  created_at: "2026-09-02T01:00:00.000Z",
  date: "2026-09-01",
  dose: 18,
  duration_seconds: 150,
  id: "brew-1",
  is_public: false,
  lat: null,
  lng: null,
  memo: "단맛이 좋았다",
  menu: null,
  method: "핸드드립",
  photos: [],
  price: null,
  score: 4.5,
  sweetness: 5,
  temperature: null,
  type: "home",
  user_id: "user-1",
  water: 300,
  water_temp: 92,
};

describe("toBrew", () => {
  it("집 기록의 snake_case와 초 단위 시간을 화면 타입으로 바꾼다", () => {
    expect(toBrew(baseRow)).toStrictEqual({
      beanId: "bean-1",
      beanName: "예가체프",
      beanPrice: 18000,
      beanWeight: 200,
      date: "2026-09-01",
      dose: 18,
      id: "brew-1",
      memo: "단맛이 좋았다",
      method: "핸드드립",
      score: 4.5,
      sensory: {
        acidity: 4,
        aftertaste: 3,
        bitterness: 2,
        body: 3,
        sweetness: 5,
      },
      time: "2:30",
      type: "home",
      water: 300,
      waterTemp: 92,
    });
  });

  it("원가 스냅샷이 없는 기존 집 기록은 값을 비워 둔다", () => {
    expect(
      toBrew({
        ...baseRow,
        bean_price: null,
        bean_weight: null,
      }),
    ).toMatchObject({
      beanPrice: undefined,
      beanWeight: undefined,
      type: "home",
    });
  });

  it("지도 데이터의 위치와 온도를 브라우저 데이터 형식으로 바꾼다", () => {
    expect(
      toBrew({
        ...baseRow,
        address: "서울 마포구",
        bean_id: null,
        bean_name: null,
        cafe_name: "프릳츠 도화점",
        date: "2026-08-30",
        dose: null,
        duration_seconds: null,
        lat: 37.5407,
        lng: 126.9502,
        memo: null,
        menu: "아메리카노",
        method: null,
        price: 5000,
        temperature: "hot",
        type: "cafe",
        water: null,
        water_temp: null,
      }),
    ).toStrictEqual({
      address: "서울 마포구",
      cafeName: "프릳츠 도화점",
      date: "2026-08-30",
      id: "brew-1",
      location: { lat: 37.5407, lng: 126.9502 },
      memo: undefined,
      menu: "아메리카노",
      price: 5000,
      score: 4.5,
      sensory: {
        acidity: 4,
        aftertaste: 3,
        bitterness: 2,
        body: 3,
        sweetness: 5,
      },
      temperature: "hot",
      type: "cafe",
    });
  });
});

describe("toBrewInsert", () => {
  const homeInput: ResolvedBrewForm = {
    beanId: "550e8400-e29b-41d4-a716-446655440000",
    beanName: "에티오피아 예가체프",
    beanPrice: 18000,
    beanWeight: 200,
    date: "2026-09-01",
    dose: 18,
    memo: "단맛이 좋았다",
    method: "핸드드립",
    score: 4.5,
    sensory: {
      acidity: 4,
      aftertaste: 3,
      bitterness: 2,
      body: 3,
      sweetness: 5,
    },
    time: "2:30",
    type: "home",
    water: 300,
    waterTemp: 92,
  };

  it("집 기록을 원두 연결과 이름 스냅샷이 있는 insert row로 바꾼다", () => {
    expect(toBrewInsert(homeInput, "user-1")).toStrictEqual({
      acidity: 4,
      address: null,
      aftertaste: 3,
      bean_id: "550e8400-e29b-41d4-a716-446655440000",
      bean_name: "에티오피아 예가체프",
      bean_price: 18000,
      bean_weight: 200,
      bitterness: 2,
      body: 3,
      cafe_name: null,
      date: "2026-09-01",
      dose: 18,
      duration_seconds: 150,
      lat: null,
      lng: null,
      memo: "단맛이 좋았다",
      menu: null,
      method: "핸드드립",
      price: null,
      score: 4.5,
      sweetness: 5,
      temperature: null,
      type: "home",
      user_id: "user-1",
      water: 300,
      water_temp: 92,
    });
  });

  it("카페 기록은 위치를 나누고 원두·집 전용 필드를 비운다", () => {
    const cafeInput: ResolvedBrewForm = {
      address: "서울 마포구",
      cafeName: "프릳츠 도화점",
      date: "2026-08-30",
      location: { lat: 37.5407, lng: 126.9502 },
      menu: "아메리카노",
      price: 5000,
      score: 4.5,
      sensory: {
        acidity: 4,
        aftertaste: 3,
        bitterness: 2,
        body: 3,
        sweetness: 5,
      },
      temperature: "hot",
      type: "cafe",
    };

    expect(toBrewInsert(cafeInput, "user-1")).toStrictEqual({
      acidity: 4,
      address: "서울 마포구",
      aftertaste: 3,
      bean_id: null,
      bean_name: null,
      bean_price: null,
      bean_weight: null,
      bitterness: 2,
      body: 3,
      cafe_name: "프릳츠 도화점",
      date: "2026-08-30",
      dose: null,
      duration_seconds: null,
      lat: 37.5407,
      lng: 126.9502,
      memo: null,
      menu: "아메리카노",
      method: null,
      price: 5000,
      score: 4.5,
      sweetness: 5,
      temperature: "hot",
      type: "cafe",
      user_id: "user-1",
      water: null,
      water_temp: null,
    });
  });
});

describe("toBrewUpdate", () => {
  it("기록 수정 row에는 스냅샷을 포함하고 user_id는 포함하지 않는다", () => {
    expect(
      toBrewUpdate({
        beanId: "550e8400-e29b-41d4-a716-446655440000",
        beanName: "예가체프",
        beanPrice: 18000,
        beanWeight: 200,
        date: "2026-09-01",
        dose: 18,
        score: 4.5,
        sensory: {
          acidity: 4,
          aftertaste: 3,
          bitterness: 2,
          body: 3,
          sweetness: 5,
        },
        type: "home",
        water: 300,
      }),
    ).toStrictEqual({
      acidity: 4,
      address: null,
      aftertaste: 3,
      bean_id: "550e8400-e29b-41d4-a716-446655440000",
      bean_name: "예가체프",
      bean_price: 18000,
      bean_weight: 200,
      bitterness: 2,
      body: 3,
      cafe_name: null,
      date: "2026-09-01",
      dose: 18,
      duration_seconds: null,
      lat: null,
      lng: null,
      memo: null,
      menu: null,
      method: null,
      price: null,
      score: 4.5,
      sweetness: 5,
      temperature: null,
      type: "home",
      water: 300,
      water_temp: null,
    });
  });
});
