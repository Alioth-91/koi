import { describe, expect, it } from "vitest";

import {
  countBrewFilters,
  filterBrews,
  listBrewMethods,
  parseBrewFilters,
  toBrewFilterSearchParams,
} from "@/libs/brews/filters";
import type { Brew } from "@/types/brew";

const brews: Brew[] = [
  {
    beanId: "bean-1",
    beanName: "아이온 원두",
    date: "2026-09-04",
    id: "brew-1",
    method: "V60",
    score: 4.5,
    sensory: {
      acidity: 4,
      aftertaste: 3,
      bitterness: 2,
      body: 3,
      sweetness: 5,
    },
    type: "home",
  },
  {
    beanId: "bean-2",
    beanName: "다른 원두",
    date: "2026-09-03",
    id: "brew-2",
    method: "에어로프레스",
    score: 4,
    sensory: {
      acidity: 3,
      aftertaste: 3,
      bitterness: 2,
      body: 4,
      sweetness: 4,
    },
    type: "home",
  },
  {
    cafeName: "프릳츠",
    date: "2026-09-02",
    id: "brew-3",
    score: 4,
    sensory: {
      acidity: 3,
      aftertaste: 3,
      bitterness: 2,
      body: 3,
      sweetness: 4,
    },
    type: "cafe",
  },
];

describe("brew filters", () => {
  it("쿼리 파라미터를 필터 상태로 읽고 잘못된 유형은 버린다", () => {
    expect(
      parseBrewFilters(new URLSearchParams("bean=bean-1&type=home&method=V60")),
    ).toStrictEqual({ beanId: "bean-1", method: "V60", type: "home" });

    expect(parseBrewFilters(new URLSearchParams("type=invalid"))).toEqual({
      beanId: undefined,
      method: undefined,
      type: undefined,
    });
  });

  it("여러 조건을 AND로 적용한다", () => {
    expect(
      filterBrews(brews, {
        beanId: "bean-1",
        method: "V60",
        type: "home",
      }).map((brew) => brew.id),
    ).toStrictEqual(["brew-1"]);

    expect(filterBrews(brews, { type: "cafe" }).map((brew) => brew.id)).toEqual(
      ["brew-3"],
    );
  });

  it("집 기록에서 중복 없는 추출 방식을 정렬해 만든다", () => {
    expect(listBrewMethods(brews)).toStrictEqual(["V60", "에어로프레스"]);
  });

  it("필터 상태를 공유 가능한 쿼리로 만든다", () => {
    expect(
      toBrewFilterSearchParams({
        beanId: "bean-1",
        method: "V60",
        type: "home",
      }).toString(),
    ).toBe("bean=bean-1&method=V60&type=home");
  });

  it("선택된 필터 수를 센다", () => {
    expect(countBrewFilters({ beanId: "bean-1", type: "home" })).toBe(2);
  });
});
