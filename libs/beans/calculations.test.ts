import { describe, expect, it } from "vitest";

import {
  cupCost,
  daysSinceRoast,
  pricePerGram,
  remainingWeight,
} from "@/libs/beans/calculations";

describe("daysSinceRoast", () => {
  it("볶은 날부터 기준 날짜까지 지난 일수를 계산한다", () => {
    expect(daysSinceRoast("2026-08-28", new Date(2026, 8, 1, 12))).toBe(4);
  });

  it("볶은 날짜가 없거나 유효하지 않으면 undefined를 준다", () => {
    expect(daysSinceRoast(undefined)).toBeUndefined();
    expect(daysSinceRoast("2026-02-30", new Date(2026, 2, 1))).toBeUndefined();
  });
});

describe("remainingWeight", () => {
  it("구매 용량에서 누적 사용량을 뺀다", () => {
    expect(remainingWeight(200, 45)).toBe(155);
  });

  it("사용량이 구매 용량을 넘으면 0에서 멈춘다", () => {
    expect(remainingWeight(200, 230)).toBe(0);
  });

  it("구매 용량이 없으면 undefined를 준다", () => {
    expect(remainingWeight(undefined, 45)).toBeUndefined();
  });
});

describe("pricePerGram", () => {
  it("가격을 구매 용량으로 나눈다", () => {
    expect(pricePerGram(18000, 200)).toBe(90);
  });

  it("무료 원두의 g당 가격 0을 유지한다", () => {
    expect(pricePerGram(0, 200)).toBe(0);
  });

  it("가격이나 유효한 용량이 없으면 undefined를 준다", () => {
    expect(pricePerGram(undefined, 200)).toBeUndefined();
    expect(pricePerGram(18000, undefined)).toBeUndefined();
    expect(pricePerGram(18000, 0)).toBeUndefined();
  });
});

describe("cupCost", () => {
  it("g당 가격에 사용량을 곱해 한 잔 원가를 계산한다", () => {
    expect(cupCost(18000, 200, 15)).toBe(1350);
  });

  it("사용량이 없거나 0이면 undefined를 준다", () => {
    expect(cupCost(18000, 200, undefined)).toBeUndefined();
    expect(cupCost(18000, 200, 0)).toBeUndefined();
  });
});
