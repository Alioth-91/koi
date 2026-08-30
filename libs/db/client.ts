"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // !는 non-null, "undefined가 아니다" 표시, 실제로 없으면 터짐
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
