import { type AuthError, isAuthWeakPasswordError } from "@supabase/supabase-js";

export type AuthActionState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
  status?: "confirmation_required";
};

export function toSignUpErrorState(error: AuthError): AuthActionState {
  if (isAuthWeakPasswordError(error)) {
    let message: string | undefined;

    if (error.reasons.includes("pwned")) {
      message = "유출 이력이 있는 비밀번호입니다. 다른 비밀번호를 사용해주세요";
    } else if (error.reasons.includes("length")) {
      message = "비밀번호는 8자 이상 입력해주세요";
      // 조합 강제
    } else if (error.reasons.includes("characters")) {
      message = "비밀번호 설정을 확인해주세요";
    }

    if (!message) {
      throw new Error("사유가 없는 weak_password 오류");
    }

    return {
      errors: { password: [message] },
    };
  }

  if (error.code === "email_exists" || error.code === "user_already_exists") {
    return {
      message:
        "이미 가입한 주소일 수 있습니다. 로그인 또는 비밀번호 찾기를 이용해주세요",
    };
  }

  if (
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit" ||
    error.status === 429
  ) {
    return { message: "요청이 많습니다. 잠시 후 다시 시도해주세요" };
  }

  if (
    error.code === "request_timeout" ||
    error.code === "unexpected_failure" ||
    (error.status !== undefined && error.status >= 500)
  ) {
    return {
      message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요",
    };
  }

  return {
    message: "가입할 수 없습니다. 입력값을 확인하고 다시 시도해주세요",
  };
}
