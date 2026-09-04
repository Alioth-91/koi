import { NextResponse } from "next/server";

import { getAllowedOAuthOrigin, getCanonicalOrigin } from "@/libs/auth/origin";
import { createClient } from "@/libs/db/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const canonicalOrigin = getCanonicalOrigin();
  const origin = getAllowedOAuthOrigin(requestUrl.toString(), canonicalOrigin);
  const loginUrl = new URL("/login", origin ?? canonicalOrigin);
  const code = requestUrl.searchParams.get("code");

  if (!origin) {
    return NextResponse.redirect(loginUrl);
  }

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

  return NextResponse.redirect(new URL("/", origin));
}
