import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 백엔드에서 쓰는 Supabase 클라이언트
 * 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 쓰인다.
 *
 * 쿠키가 요청마다 다르기에 요청 마다 새로 만든다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트 렌더링 중에는 쿠키를 못 쓴다.
            // 토큰 갱신은 proxy.ts가 대신한다.
          }
        },
      },
    },
  );
}
