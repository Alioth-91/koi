"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { getBeanById } from "@/libs/db/beans";
import {
  deleteBrewById,
  getBrewById,
  insertBrew,
  updateBrewById,
} from "@/libs/db/brews";
import { createClient } from "@/libs/db/server";
import { brewSchema, cafeSchema, homeSchema } from "@/libs/schemas/brew";
import { parseBrewPhotoFormData } from "@/libs/schemas/brew-photo";
import type { HomeBrew } from "@/types/brew";

type BrewActionErrors = Record<string, string[] | undefined>;

export type BrewActionState = {
  errors?: BrewActionErrors;
  errorMessage?: string;
};

const brewDeleteSchema = z.object({
  brewId: z.uuid(),
});

const brewUpdateSchema = z.discriminatedUnion("type", [
  homeSchema.extend({ brewId: z.uuid() }),
  cafeSchema.extend({ brewId: z.uuid() }),
]);

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

    let brewInput: unknown = input;

    if (input instanceof FormData) {
      const parsedPhotoForm = parseBrewPhotoFormData(input);

      if (parsedPhotoForm.photos.length > 0) {
        return { errorMessage: "사진 업로드 기능을 준비 중입니다" };
      }

      brewInput = parsedPhotoForm.brewInput;
    }

    const parsed = brewSchema.safeParse(brewInput);

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

export async function updateBrew(input: unknown): Promise<BrewActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("기록 수정 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 기록을 수정해주세요" };
    }

    const parsed = brewUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return { errors: z.flattenError(parsed.error).fieldErrors };
    }

    const { brewId, ...brewInput } = parsed.data;
    const currentBrew = await getBrewById(brewId);

    if (!currentBrew) {
      return {
        errorMessage: "기록을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요",
      };
    }

    if (currentBrew.type !== brewInput.type) {
      return { errorMessage: "기록 종류는 수정할 수 없습니다" };
    }

    if (brewInput.type === "home") {
      if (currentBrew.type !== "home") {
        return { errorMessage: "기록 종류는 수정할 수 없습니다" };
      }

      const isSameBean = currentBrew.beanId === brewInput.beanId;
      let snapshot: Pick<HomeBrew, "beanName" | "beanPrice" | "beanWeight">;

      if (isSameBean) {
        snapshot = {
          beanName: currentBrew.beanName,
          beanPrice: currentBrew.beanPrice,
          beanWeight: currentBrew.beanWeight,
        };
      } else {
        const bean = await getBeanById(brewInput.beanId);

        if (!bean) {
          return {
            errors: {
              beanId: [
                "선택한 원두를 찾을 수 없습니다. 새로고침 후 다시 선택해주세요",
              ],
            },
          };
        }

        snapshot = {
          beanName: bean.name,
          beanPrice: bean.price,
          beanWeight: bean.weight,
        };
      }

      await updateBrewById(brewId, {
        ...brewInput,
        ...snapshot,
      });
    } else {
      await updateBrewById(brewId, brewInput);
    }

    revalidatePath("/brews", "layout");
    revalidatePath(`/brews/${brewId}`);
  } catch (error) {
    console.error("기록 수정 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "기록을 수정하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}

export async function deleteBrew(input: unknown): Promise<BrewActionState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("기록 삭제 전 사용자 확인에 실패했습니다", error);
      return {
        errorMessage: "로그인 상태를 확인하지 못했습니다. 다시 시도해주세요",
      };
    }

    if (!data.user) {
      return { errorMessage: "로그인 후 기록을 삭제해주세요" };
    }

    const parsed = brewDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return { errorMessage: "기록을 삭제할 수 없습니다" };
    }

    await deleteBrewById(parsed.data.brewId);
    revalidatePath("/brews", "layout");
    revalidatePath(`/brews/${parsed.data.brewId}`);
  } catch (error) {
    console.error("기록 삭제 중 예상하지 못한 오류가 발생했습니다", error);

    return {
      errorMessage: "기록을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {};
}
