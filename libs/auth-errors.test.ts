import { AuthApiError, AuthWeakPasswordError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { toSignUpErrorState } from "@/libs/auth-errors";

describe("toSignUpErrorState", () => {
  it("유출된 비밀번호를 비밀번호 필드 오류로 바꾼다", () => {
    const error = new AuthWeakPasswordError("Weak password", 422, ["pwned"]);

    expect(toSignUpErrorState(error)).toEqual({
      errors: {
        password: [
          "유출 이력이 있는 비밀번호입니다. 다른 비밀번호를 사용해주세요",
        ],
      },
    });
  });

  it("Supabase의 길이와 문자 규칙 오류를 비밀번호 필드 오류로 바꾼다", () => {
    const lengthError = new AuthWeakPasswordError("Weak password", 422, [
      "length",
    ]);
    const characterError = new AuthWeakPasswordError("Weak password", 422, [
      "characters",
    ]);

    expect([
      toSignUpErrorState(lengthError),
      toSignUpErrorState(characterError),
    ]).toEqual([
      { errors: { password: ["비밀번호는 8자 이상 입력해주세요"] } },
      { errors: { password: ["비밀번호 설정을 확인해주세요"] } },
    ]);
  });

  it("중복 계정 오류에서 이메일의 가입 여부를 확정하지 않는다", () => {
    const emailExists = new AuthApiError("Email exists", 422, "email_exists");
    const userExists = new AuthApiError(
      "User exists",
      422,
      "user_already_exists",
    );
    const expectedState = {
      message:
        "이미 가입한 주소일 수 있습니다. 로그인 또는 비밀번호 찾기를 이용해주세요",
    };

    expect([
      toSignUpErrorState(emailExists),
      toSignUpErrorState(userExists),
    ]).toEqual([expectedState, expectedState]);
  });

  it("요청 제한 오류를 잠시 후 재시도 안내로 바꾼다", () => {
    const emailLimit = new AuthApiError(
      "Email rate limit",
      429,
      "over_email_send_rate_limit",
    );
    const requestLimit = new AuthApiError(
      "Request rate limit",
      429,
      "over_request_rate_limit",
    );
    const statusOnly = new AuthApiError("Rate limit", 429, undefined);
    const expectedState = {
      message: "요청이 많습니다. 잠시 후 다시 시도해주세요",
    };

    expect([
      toSignUpErrorState(emailLimit),
      toSignUpErrorState(requestLimit),
      toSignUpErrorState(statusOnly),
    ]).toEqual([expectedState, expectedState, expectedState]);
  });

  it("서버와 네트워크 오류를 서버 문제 안내로 바꾼다", () => {
    const serverError = new AuthApiError(
      "Server error",
      500,
      "unexpected_failure",
    );
    const timeoutError = new AuthApiError(
      "Request timeout",
      504,
      "request_timeout",
    );
    const expectedState = {
      message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요",
    };

    expect([
      toSignUpErrorState(serverError),
      toSignUpErrorState(timeoutError),
    ]).toEqual([expectedState, expectedState]);
  });

  it("분류하지 않은 오류는 안전한 일반 안내로 바꾼다", () => {
    const error = new AuthApiError("Captcha failed", 400, "captcha_failed");

    expect(toSignUpErrorState(error)).toEqual({
      message: "가입할 수 없습니다. 입력값을 확인하고 다시 시도해주세요",
    });
  });
});
