import { describe, expect, it } from "vitest";

import {
  toBean,
  toBeanInsert,
  toBeanPhotoColumns,
  toBeanUpdate,
} from "@/libs/db/bean-mappers";
import type { Database } from "@/types/supabase";

type BeanRow = Database["public"]["Tables"]["beans"]["Row"];

describe("toBean", () => {
  it("DB row의 snake_case 필드를 화면용 Bean으로 바꾼다", () => {
    const row: BeanRow = {
      archived: false,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-1",
      name: "예가체프",
      photo_1_large_path: null,
      photo_1_thumbnail_path: null,
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
      price: 18000,
      process: "워시드",
      roast_level: "라이트",
      roasted_at: "2026-08-28",
      roastery: "펠트 커피",
      user_id: "user-1",
      weight: 200,
    };

    expect(toBean(row)).toStrictEqual({
      archived: false,
      id: "bean-1",
      name: "예가체프",
      price: 18000,
      process: "워시드",
      roastLevel: "라이트",
      roastedAt: "2026-08-28",
      roastery: "펠트 커피",
      weight: 200,
      photos: [],
    });
  });

  it("nullable DB 값은 undefined로 바꾸고 내부 필드는 제외한다", () => {
    const row: BeanRow = {
      archived: true,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-2",
      name: "케냐 AA",
      photo_1_large_path: null,
      photo_1_thumbnail_path: null,
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
      price: null,
      process: null,
      roast_level: null,
      roasted_at: null,
      roastery: null,
      user_id: "user-1",
      weight: null,
    };

    expect(toBean(row)).toStrictEqual({
      archived: true,
      id: "bean-2",
      name: "케냐 AA",
      price: undefined,
      process: undefined,
      roastLevel: undefined,
      roastedAt: undefined,
      roastery: undefined,
      weight: undefined,
      photos: [],
    });
  });

  it("세 슬롯의 순서와 variant 쌍을 보존한다", () => {
    const row: BeanRow = {
      archived: false,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-3",
      name: "콜롬비아 핑크 버번",
      photo_1_large_path: "user-1/beans/bean-3/photo-1/large.webp",
      photo_1_thumbnail_path:
        "user-1/beans/bean-3/photo-1/thumbnail.webp",
      photo_2_large_path: "user-1/beans/bean-3/photo-2/large.webp",
      photo_2_thumbnail_path:
        "user-1/beans/bean-3/photo-2/thumbnail.webp",
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
      price: null,
      process: "내추럴",
      roast_level: "라이트",
      roasted_at: null,
      roastery: "모모스",
      user_id: "user-1",
      weight: null,
    };

    expect(toBean(row).photos).toStrictEqual([
      {
        largePath: "user-1/beans/bean-3/photo-1/large.webp",
        thumbnailPath: "user-1/beans/bean-3/photo-1/thumbnail.webp",
      },
      {
        largePath: "user-1/beans/bean-3/photo-2/large.webp",
        thumbnailPath: "user-1/beans/bean-3/photo-2/thumbnail.webp",
      },
    ]);
  });

  it("한 variant만 있는 비정상 row를 조용히 버리지 않는다", () => {
    const row: BeanRow = {
      archived: false,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-4",
      name: "케냐 AA",
      photo_1_large_path: null,
      photo_1_thumbnail_path: "user-1/beans/bean-4/photo-1/thumbnail.webp",
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
      price: null,
      process: null,
      roast_level: null,
      roasted_at: null,
      roastery: null,
      user_id: "user-1",
      weight: null,
    };

    expect(() => toBean(row)).toThrow("유효하지 않은 원두 사진입니다");
  });
});

describe("toBeanPhotoColumns", () => {
  it("사진 배열을 여섯 개 nullable 컬럼으로 펼친다", () => {
    expect(
      toBeanPhotoColumns([
        {
          largePath: "user-1/beans/bean-1/photo-1/large.webp",
          thumbnailPath: "user-1/beans/bean-1/photo-1/thumbnail.webp",
        },
        {
          largePath: "user-1/beans/bean-1/photo-2/large.webp",
          thumbnailPath: "user-1/beans/bean-1/photo-2/thumbnail.webp",
        },
      ]),
    ).toStrictEqual({
      photo_1_large_path: "user-1/beans/bean-1/photo-1/large.webp",
      photo_1_thumbnail_path:
        "user-1/beans/bean-1/photo-1/thumbnail.webp",
      photo_2_large_path: "user-1/beans/bean-1/photo-2/large.webp",
      photo_2_thumbnail_path:
        "user-1/beans/bean-1/photo-2/thumbnail.webp",
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
    });
  });

  it("사진이 없으면 여섯 컬럼을 모두 null로 만든다", () => {
    expect(toBeanPhotoColumns([])).toStrictEqual({
      photo_1_large_path: null,
      photo_1_thumbnail_path: null,
      photo_2_large_path: null,
      photo_2_thumbnail_path: null,
      photo_3_large_path: null,
      photo_3_thumbnail_path: null,
    });
  });
});

describe("toBeanInsert", () => {
  it("화면용 입력을 DB insert row로 바꾸고 user_id를 추가한다", () => {
    expect(
      toBeanInsert(
        {
          name: "예가체프",
          price: 18000,
          process: "워시드",
          roastLevel: "라이트",
          roastedAt: "2026-08-28",
          roastery: "펠트 커피",
          weight: 200,
        },
        "user-1",
      ),
    ).toStrictEqual({
      name: "예가체프",
      price: 18000,
      process: "워시드",
      roast_level: "라이트",
      roasted_at: "2026-08-28",
      roastery: "펠트 커피",
      user_id: "user-1",
      weight: 200,
    });
  });

  it("비어 있는 선택값은 DB에서 null로 저장한다", () => {
    expect(toBeanInsert({ name: "케냐 AA" }, "user-1")).toStrictEqual({
      name: "케냐 AA",
      price: null,
      process: null,
      roast_level: null,
      roasted_at: null,
      roastery: null,
      user_id: "user-1",
      weight: null,
    });
  });
});

describe("toBeanUpdate", () => {
  it("화면용 입력을 DB update row로 바꾸고 archived는 포함하지 않는다", () => {
    expect(
      toBeanUpdate({
        name: "예가체프",
        price: 18000,
        process: "워시드",
        roastLevel: "라이트",
        roastedAt: "2026-08-28",
        roastery: "펠트 커피",
        weight: 200,
      }),
    ).toStrictEqual({
      name: "예가체프",
      price: 18000,
      process: "워시드",
      roast_level: "라이트",
      roasted_at: "2026-08-28",
      roastery: "펠트 커피",
      weight: 200,
    });
  });

  it("비어 있는 선택값은 DB에서 null로 갱신한다", () => {
    expect(toBeanUpdate({ name: "케냐 AA" })).toStrictEqual({
      name: "케냐 AA",
      price: null,
      process: null,
      roast_level: null,
      roasted_at: null,
      roastery: null,
      weight: null,
    });
  });
});
