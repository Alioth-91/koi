"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/libs/utils";

type Props = {
  children: ReactNode;
  isAuthenticated: boolean;
};

function isPublicPath(pathname: string) {
  return pathname === "/community" || pathname.startsWith("/community/");
}

export default function LoginGate({ children, isAuthenticated }: Props) {
  const pathname = usePathname();
  const needsLogin = !isAuthenticated && !isPublicPath(pathname);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        aria-hidden={needsLogin}
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          needsLogin && "pointer-events-none opacity-65 blur-[3px] select-none",
        )}
      >
        {children}
      </div>

      {needsLogin && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/65 p-6">
          <section
            aria-label="로그인 필요"
            className="w-full max-w-sm rounded-3xl border border-border-foreground bg-background/95 p-6 text-center shadow-card"
          >
            <div
              aria-hidden="true"
              className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-tint text-xl"
            >
              ☕
            </div>

            <h2 className="mt-4 text-lg font-extrabold">
              로그인하고 나만의 커피 기록을 시작해보세요
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              기록을 저장하고 원두와 레시피를 관리할 수 있어요.
            </p>

            <Link
              className="mt-5 block rounded-xl bg-primary px-4 py-3 font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
              href="/login"
            >
              로그인하기
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
