import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatScore, today } from "@/libs/utils";

describe("today", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * today()를 `toISOString().slice(0, 10)`으로 수정하면 여기서 실패
   * 한국 오전 9시 이전에 등록한 것은 하루 전날로 잡힘
   */
  it("한국 시간 오전 9시 이전에도 오늘 날짜를 준다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T23:30:00Z"));

    expect(today()).toBe("2026-08-29");
  });

  it("한 자리 월·일을 두 자리로 채운다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T12:00:00+09:00"));

    expect(today()).toBe("2026-01-05");
  });
});

describe("formatDate", () => {
  it("연도는 두 자리로 줄인다", () => {
    expect(formatDate("2026-08-25")).toBe("26년 08월 25일");
  });
});

describe("formatScore", () => {
  it("정수도 소수 한 자리로 고정한다", () => {
    expect(formatScore(4)).toBe("4.0");
  });
});
