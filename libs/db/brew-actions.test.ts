import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteBrewById: vi.fn(),
  getBeanById: vi.fn(),
  getUser: vi.fn(),
  insertBrew: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/libs/db/beans", () => ({
  getBeanById: mocks.getBeanById,
}));

vi.mock("@/libs/db/brews", () => ({
  deleteBrewById: mocks.deleteBrewById,
  insertBrew: mocks.insertBrew,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import {
  createBrew,
  deleteBrew as deleteBrewAction,
} from "@/app/(main)/(private)/brews/actions";

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
    mocks.insertBrew.mockResolvedValue(undefined);
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
