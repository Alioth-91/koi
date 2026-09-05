import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createSignedUrl: vi.fn(),
  from: vi.fn(),
  remove: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/libs/db/server", () => ({
  createClient: mocks.createClient,
}));

import {
  removeBrewPhotoPair,
  signBrewPhotoUrls,
  uploadBrewPhotoPair,
} from "@/libs/storage";

describe("uploadBrewPhotoPair", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("photo-1");
    mocks.createClient.mockResolvedValue({
      storage: { from: mocks.from },
    });
    mocks.from.mockReturnValue({
      createSignedUrl: mocks.createSignedUrl,
      remove: mocks.remove,
      upload: mocks.upload,
    });
    mocks.upload.mockResolvedValue({
      data: { fullPath: "ignored", id: "ignored", path: "ignored" },
      error: null,
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("thumbnail과 large를 같은 photoId의 WebP object로 업로드한다", async () => {
    const thumbnail = new Blob(["thumbnail"], { type: "image/webp" });
    const large = new Blob(["large"], { type: "image/webp" });

    await expect(
      uploadBrewPhotoPair({
        brewId: "brew-1",
        large,
        thumbnail,
        userId: "user-1",
      }),
    ).resolves.toStrictEqual({
      largePath: "user-1/brews/brew-1/photo-1/large.webp",
      thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
    });

    expect(mocks.from).toHaveBeenCalledWith("brew-photos");
    expect(mocks.upload).toHaveBeenNthCalledWith(
      1,
      "user-1/brews/brew-1/photo-1/thumbnail.webp",
      thumbnail,
      { contentType: "image/webp", upsert: false },
    );
    expect(mocks.upload).toHaveBeenNthCalledWith(
      2,
      "user-1/brews/brew-1/photo-1/large.webp",
      large,
      { contentType: "image/webp", upsert: false },
    );
  });

  it("large 업로드가 실패하면 이미 올라간 thumbnail을 정리한다", async () => {
    const thumbnail = new Blob(["thumbnail"], { type: "image/webp" });
    const large = new Blob(["large"], { type: "image/webp" });
    const uploadError = new Error("large upload failed");

    mocks.upload
      .mockResolvedValueOnce({
        data: { fullPath: "ignored", id: "ignored", path: "ignored" },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: uploadError });
    mocks.remove.mockResolvedValue({ data: [], error: null });

    await expect(
      uploadBrewPhotoPair({
        brewId: "brew-1",
        large,
        thumbnail,
        userId: "user-1",
      }),
    ).rejects.toThrow("기록 사진 업로드에 실패했습니다");

    expect(mocks.remove).toHaveBeenCalledWith([
      "user-1/brews/brew-1/photo-1/thumbnail.webp",
    ]);
  });
});

describe("removeBrewPhotoPair", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      storage: { from: mocks.from },
    });
    mocks.from.mockReturnValue({
      createSignedUrl: mocks.createSignedUrl,
      remove: mocks.remove,
      upload: mocks.upload,
    });
    mocks.remove.mockResolvedValue({ data: [], error: null });
  });

  it("thumbnail과 large를 한 번의 remove로 함께 삭제한다", async () => {
    await expect(
      removeBrewPhotoPair({
        largePath: "user-1/brews/brew-1/photo-1/large.webp",
        thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
      }),
    ).resolves.toBeUndefined();

    expect(mocks.from).toHaveBeenCalledWith("brew-photos");
    expect(mocks.remove).toHaveBeenCalledWith([
      "user-1/brews/brew-1/photo-1/thumbnail.webp",
      "user-1/brews/brew-1/photo-1/large.webp",
    ]);
  });
});

describe("signBrewPhotoUrls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      storage: { from: mocks.from },
    });
    mocks.from.mockReturnValue({
      createSignedUrl: mocks.createSignedUrl,
      remove: mocks.remove,
      upload: mocks.upload,
    });
  });

  it("두 variant의 signed URL을 원래 사진 정보와 함께 반환한다", async () => {
    const photo = {
      largePath: "user-1/brews/brew-1/photo-1/large.webp",
      thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
    };
    mocks.createSignedUrl
      .mockResolvedValueOnce({
        data: { signedUrl: "https://example.test/thumbnail" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { signedUrl: "https://example.test/large" },
        error: null,
      });

    await expect(signBrewPhotoUrls([photo])).resolves.toStrictEqual([
      {
        ...photo,
        largeUrl: "https://example.test/large",
        thumbnailUrl: "https://example.test/thumbnail",
      },
    ]);

    expect(mocks.createSignedUrl).toHaveBeenNthCalledWith(
      1,
      photo.thumbnailPath,
      expect.any(Number),
    );
    expect(mocks.createSignedUrl).toHaveBeenNthCalledWith(
      2,
      photo.largePath,
      expect.any(Number),
    );
  });

  it("signed URL 생성 실패를 일반 오류로 변환한다", async () => {
    mocks.createSignedUrl
      .mockResolvedValueOnce({
        data: null,
        error: new Error("private storage detail"),
      })
      .mockResolvedValueOnce({
        data: { signedUrl: "https://example.test/large" },
        error: null,
      });

    await expect(
      signBrewPhotoUrls([
        {
          largePath: "user-1/brews/brew-1/photo-1/large.webp",
          thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
        },
      ]),
    ).rejects.toThrow("기록 사진 URL 생성에 실패했습니다");
  });
});
