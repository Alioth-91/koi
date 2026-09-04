"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { getBeanById } from "@/libs/db/beans";
import { insertBrew } from "@/libs/db/brews";
import { createClient } from "@/libs/db/server";
import { brewSchema } from "@/libs/schemas/brew";

type BrewActionErrors = Record<string, string[] | undefined>;

export type BrewActionState = {
  errors?: BrewActionErrors;
  errorMessage?: string;
};

export async function createBrew(input: unknown): Promise<BrewActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("기록 저장 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 기록을 등록해주세요" };
    }

    const parsed = brewSchema.safeParse(input);

    if (!parsed.success) {
      return { errors: z.flattenError(parsed.error).fieldErrors };
    }

    if (parsed.data.type === "home") {
      const bean = await getBeanById(parsed.data.beanId);

      if (!bean) {
        return {
          errors: {
            beanId: [
              "선택한 원두를 찾을 수 없습니다. 새로고침 후 다시 선택해주세요",
            ],
          },
        };
      }

      await insertBrew(
        {
          ...parsed.data,
          beanName: bean.name,
          beanPrice: bean.price,
          beanWeight: bean.weight,
        },
        data.user.id,
      );
    } else {
      await insertBrew(parsed.data, data.user.id);
    }

    revalidatePath("/brews", "layout");
  } catch (error) {
    console.error("기록 저장 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}
