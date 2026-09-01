import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";

import { redirectWithResponseState } from "@/libs/auth/response";

describe("redirectWithResponseState", () => {
  it("preserves auth cookies and headers without copying Next internals", () => {
    const source = NextResponse.next();
    source.cookies.set({
      name: "sb-test-auth-token",
      value: "",
      maxAge: 0,
      path: "/",
    });

    const response = redirectWithResponseState(
      new URL("http://localhost:3000/login"),
      source,
      {
        "Cache-Control": "private, no-store",
        Expires: "0",
        Pragma: "no-cache",
      },
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("x-middleware-next")).toBeNull();
    expect(response.cookies.get("sb-test-auth-token")).toMatchObject({
      name: "sb-test-auth-token",
      value: "",
      maxAge: 0,
      path: "/",
    });
  });
});
