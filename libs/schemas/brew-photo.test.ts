import { describe, expect, it } from "vitest";

import { parseBrewPhotoFormData } from "@/libs/schemas/brew-photo";

const validBrew = {
  beanId: "550e8400-e29b-41d4-a716-446655440000",
  date: "2026-09-05",
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

describe("parseBrewPhotoFormData", () => {
  it("기록 정보와 새 사진 한 쌍을 함께 읽는다", () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const thumbnail = new File(["thumbnail"], "thumbnail.webp", {
      type: "image/webp",
    });
    const large = new File(["large"], "large.webp", {
      type: "image/webp",
    });
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set(
      "photos",
      JSON.stringify([{ clientId, kind: "new" }]),
    );
    formData.set(`photo:${clientId}:thumbnail`, thumbnail);
    formData.set(`photo:${clientId}:large`, large);

    expect(parseBrewPhotoFormData(formData)).toStrictEqual({
      brewInput: validBrew,
      newPhotos: [{ clientId, large, thumbnail }],
      photos: [{ clientId, kind: "new" }],
    });
  });

  it("기존 사진은 경로로 읽고 새 업로드 목록에서는 제외한다", () => {
    const formData = new FormData();
    const existingPhoto = {
      kind: "existing" as const,
      largePath: "user-1/brews/brew-1/photo-1/large.webp",
      thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
    };

    formData.set("brew", JSON.stringify(validBrew));
    formData.set("photos", JSON.stringify([existingPhoto]));

    expect(parseBrewPhotoFormData(formData)).toStrictEqual({
      brewInput: validBrew,
      newPhotos: [],
      photos: [existingPhoto],
    });
  });

  it("새 사진 식별자가 중복되면 거부한다", () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set(
      "photos",
      JSON.stringify([
        { clientId, kind: "new" },
        { clientId, kind: "new" },
      ]),
    );
    formData.set(
      `photo:${clientId}:thumbnail`,
      new File(["thumbnail"], "thumbnail.webp", { type: "image/webp" }),
    );
    formData.set(
      `photo:${clientId}:large`,
      new File(["large"], "large.webp", { type: "image/webp" }),
    );

    expect(() => parseBrewPhotoFormData(formData)).toThrow();
  });

  it("내용이 없는 WebP 파일은 거부한다", () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set("photos", JSON.stringify([{ clientId, kind: "new" }]));
    formData.set(
      `photo:${clientId}:thumbnail`,
      new File([], "thumbnail.webp", { type: "image/webp" }),
    );
    formData.set(
      `photo:${clientId}:large`,
      new File([], "large.webp", { type: "image/webp" }),
    );

    expect(() => parseBrewPhotoFormData(formData)).toThrow();
  });

  it("사진은 최대 3장까지만 받는다", () => {
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set(
      "photos",
      JSON.stringify(
        [1, 2, 3, 4].map((photoNumber) => ({
          kind: "existing",
          largePath: `large-${photoNumber}.webp`,
          thumbnailPath: `thumbnail-${photoNumber}.webp`,
        })),
      ),
    );

    expect(() => parseBrewPhotoFormData(formData)).toThrow();
  });

  it("새 사진의 두 파일 중 하나라도 없으면 거부한다", () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set("photos", JSON.stringify([{ clientId, kind: "new" }]));
    formData.set(
      `photo:${clientId}:thumbnail`,
      new File(["thumbnail"], "thumbnail.webp", { type: "image/webp" }),
    );

    expect(() => parseBrewPhotoFormData(formData)).toThrow();
  });

  it("WebP가 아닌 사진 파일은 거부한다", () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const formData = new FormData();

    formData.set("brew", JSON.stringify(validBrew));
    formData.set("photos", JSON.stringify([{ clientId, kind: "new" }]));
    formData.set(
      `photo:${clientId}:thumbnail`,
      new File(["thumbnail"], "thumbnail.png", { type: "image/png" }),
    );
    formData.set(
      `photo:${clientId}:large`,
      new File(["large"], "large.webp", { type: "image/webp" }),
    );

    expect(() => parseBrewPhotoFormData(formData)).toThrow();
  });
});
