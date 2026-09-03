import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  insertBean: vi.fn(),
  listBeans: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/libs/db/beans", () => ({
  insertBean: mocks.insertBean,
  listBeans: mocks.listBeans,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import { createBean, loadBeans } from "@/app/(main)/(private)/beans/actions";

describe("createBean", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.insertBean.mockResolvedValue(undefined);
    mocks.listBeans.mockResolvedValue([]);
  });

  it("인증된 사용자의 원두 목록을 반환한다", async () => {
    const beans = [{ id: "bean-1", name: "케냐 AA" }];
    mocks.listBeans.mockResolvedValue(beans);

    await expect(loadBeans()).resolves.toStrictEqual(beans);
  });

  it("저장 성공 후 원두 페이지 레이아웃을 갱신한다", async () => {
    await expect(createBean({ name: "케냐 AA" })).resolves.toStrictEqual({});

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/(main)/(private)/beans",
      "layout",
    );
  });
});
