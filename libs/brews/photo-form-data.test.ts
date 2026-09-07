import { describe, expect, it } from "vitest";

import { toBrewPhotoFormData } from "@/libs/brews/photo-form-data";

describe("toBrewPhotoFormData", () => {
  it("기록값과 사진 파일을 서버 필드로 담는다", () => {
    const clientId = "550e8400-e29b-41d4-a716-446655440000";
    const brew = {
      cafeName: "카페",
      date: "2026-09-08",
      score: 4,
      sensory: { acidity: 0, aftertaste: 0, bitterness: 0, body: 0, sweetness: 0 } as const,
      type: "cafe" as const,
    };
    const formData = toBrewPhotoFormData(brew, [{
      clientId,
      large: new Blob(["large"], { type: "image/webp" }),
      thumbnail: new Blob(["thumbnail"], { type: "image/webp" }),
    }]);

    expect(formData.get("brew")).toBe(JSON.stringify(brew));
    expect(formData.get("photos")).toBe(JSON.stringify([{ kind: "new", clientId }]));
    expect(formData.get(`photo:${clientId}:large`)).toMatchObject({ type: "image/webp" });
    expect(formData.get(`photo:${clientId}:thumbnail`)).toMatchObject({ type: "image/webp" });
  });
});
