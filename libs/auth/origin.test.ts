import { describe, expect, it } from "vitest";

import { getAllowedOAuthOrigin, getCanonicalOrigin } from "@/libs/auth/origin";

describe("OAuth origin", () => {
  it("canonical origin에서 경로와 슬래시를 제거한다", () => {
    expect(getCanonicalOrigin("https://koi-chan291.vercel.app/", false)).toBe(
      "https://koi-chan291.vercel.app",
    );
  });

  it("개발 환경에서 주소가 없으면 localhost를 사용한다", () => {
    expect(getCanonicalOrigin(undefined, true)).toBe("http://localhost:3000");
  });

  it("운영 canonical origin에는 HTTPS를 요구한다", () => {
    expect(() =>
      getCanonicalOrigin("http://koi-chan291.vercel.app", false),
    ).toThrow("운영 OAuth 주소는 HTTPS여야 합니다");
  });

  it("개발 환경에서는 localhost와 canonical origin만 허용한다", () => {
    expect(
      getAllowedOAuthOrigin(
        "http://localhost:3000/auth/callback",
        "https://koi-chan291.vercel.app",
        true,
      ),
    ).toBe("http://localhost:3000");
  });

  it("운영 환경에서는 canonical origin이 아닌 주소를 거부한다", () => {
    expect(
      getAllowedOAuthOrigin(
        "https://preview-koi.vercel.app/auth/callback",
        "https://koi-chan291.vercel.app",
        false,
      ),
    ).toBeNull();
  });
});
