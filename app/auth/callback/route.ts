import { NextResponse } from "next/server";

import { createClient } from "@/libs/db/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const loginUrl = new URL("/login", requestUrl);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL("/", requestUrl));
}
