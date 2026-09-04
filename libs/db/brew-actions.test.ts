import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
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
  insertBrew: mocks.insertBrew,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import { createBrew } from "@/app/(main)/(private)/brews/actions";

describe("createBrew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
