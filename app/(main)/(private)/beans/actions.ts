"use server";

import * as z from "zod";

import { insertBean } from "@/libs/db/beans";
import { createClient } from "@/libs/db/server";
import { beanSchema, type BeanForm } from "@/libs/schemas/bean";

type BeanFieldErrors = Partial<Record<keyof BeanForm, string[]>>;

export type BeanActionState = {
  errors?: BeanFieldErrors;
  message?: string;
};

export async function createBean(input: unknown): Promise<BeanActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("원두 저장 전 사용자 확인에 실패했습니다", error);
      return {
        message: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { message: "로그인 후 원두를 등록해주세요" };
    }

    const parsed = beanSchema.safeParse(input);

    if (!parsed.success) {
      return { errors: z.flattenError(parsed.error).fieldErrors };
    }

    await insertBean(parsed.data, data.user.id);
  } catch (error) {
    console.error("원두 저장 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      message: "원두를 저장하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}
