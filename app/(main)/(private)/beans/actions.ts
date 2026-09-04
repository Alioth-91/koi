"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  deleteBeanById,
  insertBean,
  listBeans,
  updateBeanById,
  updateBeanArchived as updateBeanArchivedInDb,
} from "@/libs/db/beans";
import { createClient } from "@/libs/db/server";
import { beanSchema, type BeanForm } from "@/libs/schemas/bean";
import type { Bean } from "@/types/bean";

type BeanFieldErrors = Partial<Record<keyof BeanForm, string[]>>;

const beanArchiveSchema = z.object({
  archived: z.boolean(),
  beanId: z.uuid(),
});

const beanDeleteSchema = z.object({
  beanId: z.uuid(),
});

const beanUpdateSchema = beanSchema.extend({
  beanId: z.uuid(),
});

export type BeanActionState = {
  errors?: BeanFieldErrors;
  errorMessage?: string;
};

/** 기록 폼이 열릴 때 현재 사용자의 원두 목록을 조회한다. */
export async function loadBeans(): Promise<Bean[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error("원두 목록을 불러오지 못했습니다", { cause: error });
  }

  if (!data.user) return [];

  return listBeans();
}

export async function createBean(input: unknown): Promise<BeanActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("원두 저장 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 원두를 등록해주세요" };
    }

    const parsed = beanSchema.safeParse(input);

    if (!parsed.success) {
      return { errors: z.flattenError(parsed.error).fieldErrors };
    }

    await insertBean(parsed.data, data.user.id);
    revalidatePath("/(main)/(private)/beans", "layout");
  } catch (error) {
    console.error("원두 저장 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "원두를 저장하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}

export async function updateBean(input: unknown): Promise<BeanActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("원두 수정 전 사용자 확인에 실패했습니다", error);

      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 원두를 수정해주세요" };
    }

    const parsed = beanUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return { errors: z.flattenError(parsed.error).fieldErrors };
    }

    const { beanId, ...beanInput } = parsed.data;

    await updateBeanById(beanId, beanInput);

    revalidatePath("/(main)/(private)/beans", "layout");
    revalidatePath(`/beans/${beanId}`);
  } catch (error) {
    console.error("원두 수정 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "원두를 수정하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}

export async function updateBeanArchived(
  input: unknown,
): Promise<BeanActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("원두 상태 변경 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 원두 상태를 변경해주세요" };
    }

    const parsed = beanArchiveSchema.safeParse(input);

    if (!parsed.success) {
      return { errorMessage: "원두 상태를 변경할 수 없습니다" };
    }

    await updateBeanArchivedInDb(parsed.data.beanId, parsed.data.archived);
    revalidatePath("/(main)/(private)/beans", "layout");
    revalidatePath(`/beans/${parsed.data.beanId}`);
  } catch (error) {
    console.error("원두 상태 변경 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage:
        "원두 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}

export async function deleteBean(input: unknown): Promise<BeanActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("원두 삭제 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 원두를 삭제해주세요" };
    }

    const parsed = beanDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return { errorMessage: "원두를 삭제할 수 없습니다" };
    }

    await deleteBeanById(parsed.data.beanId);
    revalidatePath("/(main)/(private)/beans", "layout");
    revalidatePath(`/beans/${parsed.data.beanId}`);
  } catch (error) {
    console.error("원두 삭제 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "원두를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}
