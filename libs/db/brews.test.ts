import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@/libs/db/server", () => ({ createClient: mocks.createClient }));

import { insertBrew, updateBrewPhotos } from "@/libs/db/brews";
import {
  toBrew,
  toBrewPhotoColumns,
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
  photo_1_large_path: null,
  photo_1_thumbnail_path: null,
  photo_2_large_path: null,
  photo_2_thumbnail_path: null,
  photo_3_large_path: null,
  photo_3_thumbnail_path: null,
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
  it("사진이 없는 기록은 빈 사진 배열을 반환한다", () => {
    expect(toBrew(baseRow).photos).toStrictEqual([]);
  });

  it("세 슬롯의 순서와 variant 쌍을 보존한다", () => {
    expect(
      toBrew({
        ...baseRow,
        photo_1_large_path: "user-1/brews/brew-1/photo-1/large.webp",
        photo_1_thumbnail_path: "user-1/brews/brew-1/photo-1/thumbnail.webp",
        photo_2_large_path: "user-1/brews/brew-1/photo-2/large.webp",
        photo_2_thumbnail_path: "user-1/brews/brew-1/photo-2/thumbnail.webp",
      }).photos,
    ).toStrictEqual([
      {
        largePath: "user-1/brews/brew-1/photo-1/large.webp",
        thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
      },
      {
        largePath: "user-1/brews/brew-1/photo-2/large.webp",
        thumbnailPath: "user-1/brews/brew-1/photo-2/thumbnail.webp",
      },
    ]);
  });

  it("한 variant만 있는 비정상 row를 조용히 버리지 않는다", () => {
    expect(() =>
      toBrew({
        ...baseRow,
        photo_1_thumbnail_path: "user-1/brews/brew-1/photo-1/thumbnail.webp",
      }),
    ).toThrow("유효하지 않은 기록 사진입니다");
  });

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
      photos: [],
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
      photos: [],
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

describe("toBrewPhotoColumns", () => {
  it("사진 배열을 여섯 개 nullable 컬럼으로 펼친다", () => {
    expect(
      toBrewPhotoColumns([
        {
          largePath: "user-1/brews/brew-1/photo-1/large.webp",
          thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
        },
        {
          largePath: "user-1/brews/brew-1/photo-2/large.webp",
          thumbnailPath: "user-1/brews/brew-1/photo-2/thumbnail.webp",
        },
      ]),
    ).toStrictEqual({
      photo_1_large_path: "user-1/brews/brew-1/photo-1/large.webp",
      photo_1_thumbnail_path: "user-1/brews/brew-1/photo-1/thumbnail.webp",
      photo_2_large_path: "user-1/brews/brew-1/photo-2/large.webp",
      photo_2_thumbnail_path: "user-1/brews/brew-1/photo-2/thumbnail.webp",
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
    });
  });

  it("사진이 없으면 여섯 컬럼을 모두 null로 만든다", () => {
    expect(toBrewPhotoColumns([])).toStrictEqual({
      photo_1_large_path: null,
      photo_1_thumbnail_path: null,
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
    });
  });

  it("사진이 3장을 넘으면 거부한다", () => {
    const photo = {
      largePath: "large.webp",
      thumbnailPath: "thumbnail.webp",
    };

    expect(() => toBrewPhotoColumns([photo, photo, photo, photo])).toThrow(
      "기록 사진은 최대 3장까지 저장할 수 있습니다",
    );
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

  it("DB가 만든 기록 ID를 반환한다", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "brew-1" },
      error: null,
    });

    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single }),
        }),
      }),
    });

    await expect(insertBrew(homeInput, "user-1")).resolves.toBe("brew-1");
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

describe("updateBrewPhotos", () => {
  it("사진 경로를 올바른 기록에 저장한다", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mocks.createClient.mockResolvedValue({
      from: vi.fn().mockReturnValue({ update }),
    });

    await expect(
      updateBrewPhotos("brew-1", [
        { largePath: "large.webp", thumbnailPath: "thumbnail.webp" },
      ]),
    ).resolves.toBeUndefined();

    expect(update).toHaveBeenCalledWith({
      photo_1_large_path: "large.webp",
      photo_1_thumbnail_path: "thumbnail.webp",
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
    });
    expect(eq).toHaveBeenCalledWith("id", "brew-1");
  });
});
