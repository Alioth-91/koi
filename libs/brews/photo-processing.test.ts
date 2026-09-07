import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getBrewPhotoSize,
  isSupportedBrewPhoto,
  processBrewPhoto,
  processBrewPhotoFiles,
} from "@/libs/brews/photo-processing";

afterEach(() => vi.unstubAllGlobals());

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

describe("processBrewPhoto", () => {
  it("지원 파일을 썸네일과 큰 WebP로 변환한다", async () => {
    const bitmap = { close: vi.fn(), height: 2000, width: 3000 };
    const thumbnail = new Blob(["thumbnail"], { type: "image/webp" });
    const large = new Blob(["large"], { type: "image/webp" });
    const convertToBlob = vi
      .fn()
      .mockResolvedValueOnce(thumbnail)
      .mockResolvedValueOnce(large);

    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
    vi.stubGlobal(
      "OffscreenCanvas",
      vi.fn().mockImplementation(function () {
        return {
          convertToBlob,
          getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
        };
      }),
    );

    const result = await processBrewPhoto(
      new File(["photo"], "photo.jpg", { type: "image/jpeg" }),
    );

    expect(result).toEqual({ large, thumbnail });
    expect(convertToBlob).toHaveBeenCalledTimes(2);
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it("지원하지 않는 파일은 변환하지 않고 오류를 반환한다", async () => {
    const file = new File(["photo"], "photo.heic", { type: "image/heic" });

    await expect(processBrewPhoto(file)).rejects.toThrow(
      "JPEG·PNG·WebP 사진만 사용할 수 있습니다",
    );
  });

  it("사진을 3장 초과해서 처리하지 않는다", async () => {
    const files = Array.from(
      { length: 4 },
      () => new File(["photo"], "photo.jpg"),
    );

    await expect(processBrewPhotoFiles(files)).rejects.toThrow(
      "기록 사진은 최대 3장까지 추가할 수 있습니다",
    );
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
