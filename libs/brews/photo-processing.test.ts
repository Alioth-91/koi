import { describe, expect, it } from "vitest";

import { getBrewPhotoSize, isSupportedBrewPhoto } from "@/libs/brews/photo-processing";

describe("isSupportedBrewPhoto", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "%s 파일을 허용한다",
    (type) => {
      const file = new File(["photo"], "photo", { type });

      expect(isSupportedBrewPhoto(file)).toBe(true);
    },
  );

  it("지원하지 않는 파일 형식은 거부한다", () => {
    const file = new File(["photo"], "photo.heic", { type: "image/heic" });

    expect(isSupportedBrewPhoto(file)).toBe(false);
  });
});

describe("getBrewPhotoSize", () => {
  it("큰 사진은 비율을 유지하며 긴 변을 제한 크기로 줄인다", () => {
    expect(getBrewPhotoSize(3000, 2000, 400)).toEqual({
      width: 400,
      height: 267,
    });
  });

  it("제한 크기보다 작은 사진은 확대하지 않는다", () => {
    expect(getBrewPhotoSize(300, 200, 400)).toEqual({
      width: 300,
      height: 200,
    });
  });
});
