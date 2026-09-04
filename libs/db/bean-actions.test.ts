import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteBeanById: vi.fn(),
  getUser: vi.fn(),
  insertBean: vi.fn(),
  listBeans: vi.fn(),
  revalidatePath: vi.fn(),
  updateBeanById: vi.fn(),
  updateBeanArchived: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/libs/db/beans", () => ({
  deleteBeanById: mocks.deleteBeanById,
  insertBean: mocks.insertBean,
  listBeans: mocks.listBeans,
  updateBeanById: mocks.updateBeanById,
  updateBeanArchived: mocks.updateBeanArchived,
}));

vi.mock("@/libs/db/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import {
  createBean,
  deleteBean as deleteBeanAction,
  loadBeans,
  updateBean as updateBeanAction,
  updateBeanArchived as updateBeanArchivedAction,
} from "@/app/(main)/(private)/beans/actions";

describe("createBean", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteBeanById.mockResolvedValue(undefined);
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.insertBean.mockResolvedValue(undefined);
    mocks.listBeans.mockResolvedValue([]);
    mocks.updateBeanById.mockResolvedValue(undefined);
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

  it("원두 정보 수정 성공 후 목록과 상세를 갱신한다", async () => {
    const beanId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";

    await expect(
      updateBeanAction({
        beanId,
        name: "새 원두 이름",
        price: "21000",
        weight: "200",
      }),
    ).resolves.toStrictEqual({});

    expect(mocks.updateBeanById).toHaveBeenCalledWith(beanId, {
      name: "새 원두 이름",
      price: 21000,
      weight: 200,
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      1,
      "/(main)/(private)/beans",
      "layout",
    );
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, `/beans/${beanId}`);
  });

  it("원두 삭제 성공 후 목록과 상세를 갱신한다", async () => {
    const beanId = "024fc61d-5919-4031-9271-0ccf9a6a1af0";

    await expect(deleteBeanAction({ beanId })).resolves.toStrictEqual({});

    expect(mocks.deleteBeanById).toHaveBeenCalledWith(beanId);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      1,
      "/(main)/(private)/beans",
      "layout",
    );
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, `/beans/${beanId}`);
  });

  it("비로그인 상태에서는 원두를 삭제하지 않는다", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      deleteBeanAction({
        beanId: "024fc61d-5919-4031-9271-0ccf9a6a1af0",
      }),
    ).resolves.toStrictEqual({ errorMessage: "로그인 후 원두를 삭제해주세요" });

    expect(mocks.deleteBeanById).not.toHaveBeenCalled();
  });

  it("잘못된 원두 ID는 삭제하지 않는다", async () => {
    await expect(deleteBeanAction({ beanId: "not-a-uuid" })).resolves.toEqual({
      errorMessage: "원두를 삭제할 수 없습니다",
    });

    expect(mocks.deleteBeanById).not.toHaveBeenCalled();
  });
});
