import { describe, expect, it } from "vitest";

import { beanSchema } from "@/libs/schemas/bean";

describe("beanSchema", () => {
  it("이름만 있어도 저장된다.", () => {
    const result = beanSchema.safeParse({ name: "예가체프" });

    expect(result.success).toBe(true);
  });

  it("이름이 비면 막고 메시지를 준다", () => {
    const result = beanSchema.safeParse({ name: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("원두 이름을 입력해주세요");
  });

  it("빈 칸은 undefined가 된다", () => {
    const parsed = beanSchema.parse({ name: "예가체프", roastery: "" });

    expect(parsed.roastery).toBeUndefined();
    expect(JSON.stringify(parsed)).toBe('{"name":"예가체프"}');
  });

  it("입력칸이 준 문자열을 숫자로 바꾼다", () => {
    const parsed = beanSchema.parse({ name: "예가체프", weight: "200" });

    expect(parsed.weight).toBe(200);
  });

  it("음수 용량은 막는다", () => {
    expect(
      beanSchema.safeParse({ name: "예가체프", weight: "-1" }).success,
    ).toBe(false);
  });

  it("날짜 모양이 아니면 막는다", () => {
    expect(
      beanSchema.safeParse({ name: "예가체프", roastedAt: "몰라요" }).success,
    ).toBe(false);
  });
});
