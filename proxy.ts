import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { redirectWithResponseState } from "@/libs/auth/response";

// 설정은 계정 정보가 포함되므로 비로그인 화면을 렌더링하지 않는다.
// 나머지 메인 화면은 게스트 미리보기를 위해 페이지까지 통과시킨다.
const protectedPrefixes = ["/settings"] as const;

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * 요청마다 토큰을 갱신한다.
 *
 * 갱신된 토큰을 쿠키에 담는 일을 여기서 한다.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const authResponseHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 해당 요청의 서버 컴포넌트들이 새 토큰을 보도록 request에 심는다
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });

          // 브라우저가 다음 요청에 보내도록 response에 심는다
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );

          // 응답이 캐시되면 남의 세션이 다른 사람에게 전달된다
          Object.entries(headers).forEach(([key, value]) => {
            authResponseHeaders[key] = value;
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  // 응답이 나가기 전에 불러야 갱신된 토큰이 위 setAll로 살린다
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return redirectWithResponseState(loginUrl, response, authResponseHeaders);
  }

  return response;
}

export const config = {
  // 정적 파일은 건너뛴다.
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
};
