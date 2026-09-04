import { describe, expect, it } from "vitest";

import { homeSchema } from "@/libs/schemas/brew";

const validHomeInput = {
  beanId: "550e8400-e29b-41d4-a716-446655440000",
  date: "2026-09-01",
  score: 4.5,
  sensory: {
    acidity: 4,
    aftertaste: 3,
    bitterness: 2,
    body: 3,
    sweetness: 5,
  },
  type: "home" as const,
};

describe("homeSchema", () => {
  it("원두 UUID와 mm:ss 형식의 시간을 받는다", () => {
    const result = homeSchema.safeParse({
      ...validHomeInput,
      time: "2:30",
    });

    expect(result.success).toBe(true);
  });

  it("원두 UUID가 아니거나 초가 59를 넘으면 거부한다", () => {
    expect(
      homeSchema.safeParse({ ...validHomeInput, beanId: "bean-1" }).success,
    ).toBe(false);
    expect(
      homeSchema.safeParse({ ...validHomeInput, time: "2:60" }).success,
    ).toBe(false);
  });
});
