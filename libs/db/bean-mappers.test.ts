import { describe, expect, it } from "vitest";

import { toBean, toBeanInsert, toBeanUpdate } from "@/libs/db/bean-mappers";
import type { Database } from "@/types/supabase";

type BeanRow = Database["public"]["Tables"]["beans"]["Row"];

describe("toBean", () => {
  it("DB row의 snake_case 필드를 화면용 Bean으로 바꾼다", () => {
    const row: BeanRow = {
      archived: false,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-1",
      name: "예가체프",
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
    });
  });

  it("nullable DB 값은 undefined로 바꾸고 내부 필드는 제외한다", () => {
    const row: BeanRow = {
      archived: true,
      created_at: "2026-09-02T01:00:00.000Z",
      id: "bean-2",
      name: "케냐 AA",
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
