import { describe, expect, it } from "vitest";
import * as z from "zod";

import {
  signInSchema,
  signUpFormSchema,
  signUpSchema,
} from "@/libs/schemas/auth";

describe("signInSchema", () => {
  it("비밀번호가 비어 있지 않으면 받는다", () => {
    const emptyPassword = signInSchema.safeParse({
      email: "coffee@example.com",
      password: "",
    });

    const existingPassword = signInSchema.safeParse({
      email: "coffee@example.com",
      password: "secret",
    });

    expect([emptyPassword.success, existingPassword.success]).toEqual([
      false,
      true,
    ]);
  });
});

describe("signUpSchema", () => {
  it("비밀번호는 8자부터 받는다", () => {
    const sevenCharacters = signUpSchema.safeParse({
      email: "coffee@example.com",
      password: "1234567",
    });
    const eightCharacters = signUpSchema.safeParse({
      email: "coffee@example.com",
      password: "12345678",
    });

    expect([sevenCharacters.success, eightCharacters.success]).toEqual([
      false,
      true,
    ]);
  });

  it("이메일 형식이 아니면 이메일 필드 오류를 준다", () => {
    const result = signUpSchema.safeParse({
      email: "coffee",
      password: "12345678",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("잘못된 이메일이 검증을 통과했습니다");
    }

    expect(z.flattenError(result.error).fieldErrors.email).toContain(
      "이메일 형식을 확인해주세요",
    );
  });

  it("비밀번호가 64자보다 길면 비밀번호 필드 오류를 준다", () => {
    const result = signUpSchema.safeParse({
      email: "coffee@example.com",
      password: "a".repeat(65),
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("65자 비밀번호가 검증을 통과했습니다");
    }

    expect(z.flattenError(result.error).fieldErrors.password).toContain(
      "비밀번호는 64자 이하로 입력해주세요",
    );
  });

  it("비밀번호 확인 값은 서버 검증 결과에서 제거한다", () => {
    const result = signUpSchema.parse({
      email: "coffee@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });

    expect(result).toEqual({
      email: "coffee@example.com",
      password: "12345678",
    });
  });
});

describe("signUpFormSchema", () => {
  it("비밀번호 확인이 다르면 확인 필드 오류를 준다", () => {
    const result = signUpFormSchema.safeParse({
      email: "coffee@example.com",
      password: "12345678",
      confirmPassword: "87654321",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("서로 다른 비밀번호가 검증을 통과했습니다");
    }

    expect(z.flattenError(result.error).fieldErrors.confirmPassword).toContain(
      "비밀번호가 일치하지 않습니다",
    );
  });

  it("비밀번호 확인이 같으면 받는다", () => {
    const result = signUpFormSchema.safeParse({
      email: "coffee@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });

    expect(result.success).toBe(true);
  });
});
