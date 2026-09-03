import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  insertBean: vi.fn(),
  listBeans: vi.fn(),
  revalidatePath: vi.fn(),
  updateBeanArchived: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/libs/db/beans", () => ({
  insertBean: mocks.insertBean,
  listBeans: mocks.listBeans,
  updateBeanArchived: mocks.updateBeanArchived,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import {
  createBean,
  loadBeans,
  updateBeanArchived as updateBeanArchivedAction,
} from "@/app/(main)/(private)/beans/actions";

describe("createBean", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.insertBean.mockResolvedValue(undefined);
    mocks.listBeans.mockResolvedValue([]);
    mocks.updateBeanArchived.mockResolvedValue(undefined);
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

  it("원두 상태 변경 성공 후 목록과 상세를 갱신한다", async () => {
    const beanId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";

    await expect(
      updateBeanArchivedAction({ archived: true, beanId }),
    ).resolves.toStrictEqual({});

    expect(mocks.updateBeanArchived).toHaveBeenCalledWith(beanId, true);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      1,
      "/(main)/(private)/beans",
      "layout",
    );
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, `/beans/${beanId}`);
  });
});
