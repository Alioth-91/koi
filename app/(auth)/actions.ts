"use server";

import { redirect } from "next/navigation";
import * as z from "zod";

import {
  type AuthActionState,
  toSignUpErrorState,
} from "@/libs/auth/errors";
import { createClient } from "@/libs/db/server";
import { signInSchema, signUpSchema } from "@/libs/schemas/auth";

export type { AuthActionState } from "@/libs/auth/errors";

export async function signIn(input: unknown): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse(input);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: "이메일 또는 비밀번호를 확인해주세요" };
  }

  redirect("/brews");
}

export async function signUp(input: unknown): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(input);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp(parsed.data);

    if (error) {
      return toSignUpErrorState(error);
    }

    if (!data.session) {
      return {
        message: "이메일의 확인 링크를 열어 가입을 완료해주세요",
        status: "confirmation_required",
      };
    }
  } catch (error) {
    console.error("회원가입 요청 중 예상하지 못한 오류가 발생했습니다", error);
    return {
      message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  redirect("/brews");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("로그아웃하지 못했습니다", { cause: error });
  }

  redirect("/login");
}
