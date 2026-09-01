import * as z from "zod";

export const signInSchema = z.object({
  email: z.email("이메일 형식을 확인해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const signUpSchema = z.object({
  email: z.email("이메일 형식을 확인해주세요"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상 입력해주세요")
    .max(64, "비밀번호는 64자 이하로 입력해주세요"),
});

export const signUpFormSchema = signUpSchema
  .extend({
    confirmPassword: z.string().min(1, "비밀번호를 다시 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });
