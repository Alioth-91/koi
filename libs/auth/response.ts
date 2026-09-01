import { NextResponse } from "next/server";

type AuthResponseHeaders = Readonly<Record<string, string>>;

export function redirectWithResponseState(
  url: URL,
  source: NextResponse,
  headers: AuthResponseHeaders,
) {
  const response = NextResponse.redirect(url);

  source.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  Object.entries(headers).forEach(([key, value]) =>
    response.headers.set(key, value),
  );

  return response;
}
