import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteBrewById: vi.fn(),
  getBeanById: vi.fn(),
  getBrewById: vi.fn(),
  getUser: vi.fn(),
  insertBrew: vi.fn(),
  revalidatePath: vi.fn(),
  updateBrewPhotos: vi.fn(),
  updateBrewById: vi.fn(),
  removeBrewPhotoPair: vi.fn(),
  uploadBrewPhotoPair: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/libs/db/beans", () => ({
  getBeanById: mocks.getBeanById,
}));

vi.mock("@/libs/db/brews", () => ({
  deleteBrewById: mocks.deleteBrewById,
  getBrewById: mocks.getBrewById,
  insertBrew: mocks.insertBrew,
  updateBrewPhotos: mocks.updateBrewPhotos,
  updateBrewById: mocks.updateBrewById,
}));

vi.mock("@/libs/storage", () => ({
  removeBrewPhotoPair: mocks.removeBrewPhotoPair,
  uploadBrewPhotoPair: mocks.uploadBrewPhotoPair,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import {
  createBrew,
  deleteBrew as deleteBrewAction,
  updateBrew as updateBrewAction,
} from "@/app/(main)/(private)/brews/actions";

const validBrewInput = {
  date: "2026-09-04",
  score: 4.5,
  sensory: {
    acidity: 4,
    aftertaste: 3,
    bitterness: 2,
    body: 3,
    sweetness: 5,
  },
  type: "home" as const,
  water: 300,
};

describe("createBrew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteBrewById.mockResolvedValue(undefined);
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.getBeanById.mockResolvedValue({
      id: "bean-1",
      name: "에티오피아 예가체프",
      price: 18000,
      weight: 200,
    });
    mocks.insertBrew.mockResolvedValue("brew-1");
    mocks.removeBrewPhotoPair.mockResolvedValue(undefined);
    mocks.updateBrewPhotos.mockResolvedValue(undefined);
    mocks.updateBrewById.mockResolvedValue(undefined);
    mocks.uploadBrewPhotoPair.mockResolvedValue({
      largePath: "user-1/brews/brew-1/photo-1/large.webp",
      thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
    });
  });

  it("집 기록 저장 시 서버가 읽은 원두 가격과 용량을 스냅샷으로 전달한다", async () => {
    await expect(
      createBrew({
        beanId: "550e8400-e29b-41d4-a716-446655440000",
        date: "2026-09-04",
        dose: 18,
        score: 4.5,
        sensory: {
          acidity: 4,
          aftertaste: 3,
          bitterness: 2,
          body: 3,
          sweetness: 5,
        },
        type: "home",
        water: 300,
      }),
    ).resolves.toStrictEqual({});

    expect(mocks.insertBrew).toHaveBeenCalledWith(
      expect.objectContaining({
        beanName: "에티오피아 예가체프",
        beanPrice: 18000,
        beanWeight: 200,
        type: "home",
      }),
      "user-1",
    );
  });

  it("사진이 없는 FormData도 기존 기록 저장 흐름으로 전달한다", async () => {
    const formData = new FormData();

    formData.set(
      "brew",
      JSON.stringify({
        ...validBrewInput,
        beanId: "550e8400-e29b-41d4-a716-446655440000",
      }),
    );
    formData.set("photos", "[]");

    await expect(createBrew(formData)).resolves.toStrictEqual({});
    expect(mocks.insertBrew).toHaveBeenCalledWith(
      expect.objectContaining({ type: "home" }),
      "user-1",
    );
  });

  it("사진이 있는 FormData는 기록 저장 후 사진 경로를 저장한다", async () => {
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const formData = new FormData();

    formData.set(
      "brew",
      JSON.stringify({
        ...validBrewInput,
        beanId: "550e8400-e29b-41d4-a716-446655440000",
      }),
    );
    formData.set("photos", JSON.stringify([{ clientId, kind: "new" }]));
    formData.set(
      `photo:${clientId}:thumbnail`,
      new File(["thumbnail"], "thumbnail.webp", { type: "image/webp" }),
    );
    formData.set(
      `photo:${clientId}:large`,
      new File(["large"], "large.webp", { type: "image/webp" }),
    );

    await expect(createBrew(formData)).resolves.toStrictEqual({});
    expect(mocks.uploadBrewPhotoPair).toHaveBeenCalledWith({
      brewId: "brew-1",
      large: expect.any(Blob),
      thumbnail: expect.any(Blob),
      userId: "user-1",
    });
    expect(mocks.updateBrewPhotos).toHaveBeenCalledWith("brew-1", [
      {
        largePath: "user-1/brews/brew-1/photo-1/large.webp",
        thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
      },
    ]);
  });

  it("사진 경로 저장에 실패하면 업로드한 사진을 삭제한다", async () => {
    const formData = new FormData();
    const clientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    formData.set("brew", JSON.stringify({ ...validBrewInput, beanId: "550e8400-e29b-41d4-a716-446655440000" }));
    formData.set("photos", JSON.stringify([{ clientId, kind: "new" }]));
    formData.set(`photo:${clientId}:thumbnail`, new File(["thumbnail"], "thumbnail.webp", { type: "image/webp" }));
    formData.set(`photo:${clientId}:large`, new File(["large"], "large.webp", { type: "image/webp" }));
    mocks.updateBrewPhotos.mockRejectedValue(new Error("db failure"));

    await expect(createBrew(formData)).resolves.toStrictEqual({
      errorMessage: "기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요",
    });
    expect(mocks.removeBrewPhotoPair).toHaveBeenCalledWith({
      largePath: "user-1/brews/brew-1/photo-1/large.webp",
      thumbnailPath: "user-1/brews/brew-1/photo-1/thumbnail.webp",
    });
  });

  it("집 기록의 원두를 바꾸면 새 원두의 스냅샷을 함께 갱신한다", async () => {
    const brewId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";
    const beanId = "550e8400-e29b-41d4-a716-446655440000";

    mocks.getBrewById.mockResolvedValue({
      beanId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      beanName: "기존 원두",
      beanPrice: 15000,
      beanWeight: 200,
      type: "home",
    });
    mocks.getBeanById.mockResolvedValue({
      id: beanId,
      name: "새 원두",
      price: 21000,
      weight: 250,
    });

    await expect(
      updateBrewAction({
        beanId,
        brewId,
        date: "2026-09-04",
        dose: 18,
        score: 4.5,
        sensory: {
          acidity: 4,
          aftertaste: 3,
          bitterness: 2,
          body: 3,
          sweetness: 5,
        },
        type: "home",
        water: 300,
      }),
    ).resolves.toStrictEqual({});

    expect(mocks.updateBrewById).toHaveBeenCalledWith(
      brewId,
      expect.objectContaining({
        beanId,
        beanName: "새 원두",
        beanPrice: 21000,
        beanWeight: 250,
      }),
    );
  });

  it("같은 원두로 집 기록을 수정하면 기존 스냅샷을 보존한다", async () => {
    const brewId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";
    const beanId = "550e8400-e29b-41d4-a716-446655440000";

    mocks.getBrewById.mockResolvedValue({
      beanId,
      beanName: "기록 당시 원두",
      beanPrice: 15000,
      beanWeight: 200,
      type: "home",
    });

    await expect(
      updateBrewAction({
        beanId,
        brewId,
        date: "2026-09-04",
        score: 4.5,
        sensory: {
          acidity: 4,
          aftertaste: 3,
          bitterness: 2,
          body: 3,
          sweetness: 5,
        },
        type: "home",
      }),
    ).resolves.toStrictEqual({});

    expect(mocks.getBeanById).not.toHaveBeenCalled();
    expect(mocks.updateBrewById).toHaveBeenCalledWith(
      brewId,
      expect.objectContaining({
        beanName: "기록 당시 원두",
        beanPrice: 15000,
        beanWeight: 200,
      }),
    );
  });

  it("기록 삭제 성공 후 목록과 상세를 갱신한다", async () => {
    const brewId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";

    await expect(deleteBrewAction({ brewId })).resolves.toStrictEqual({});

    expect(mocks.deleteBrewById).toHaveBeenCalledWith(brewId);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/brews", "layout");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, `/brews/${brewId}`);
  });

  it("비로그인 상태에서는 기록을 삭제하지 않는다", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      deleteBrewAction({
        brewId: "024fc61d-5919-4031-9271-0ccf9a6a1af0",
      }),
    ).resolves.toStrictEqual({ errorMessage: "로그인 후 기록을 삭제해주세요" });

    expect(mocks.deleteBrewById).not.toHaveBeenCalled();
  });

  it("잘못된 기록 ID는 삭제하지 않는다", async () => {
    await expect(deleteBrewAction({ brewId: "not-a-uuid" })).resolves.toEqual({
      errorMessage: "기록을 삭제할 수 없습니다",
    });

    expect(mocks.deleteBrewById).not.toHaveBeenCalled();
  });
});
