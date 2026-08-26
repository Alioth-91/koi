import Link from "next/link";

import { SITE } from "@/libs/constants/site";

/**
 * 어느 라우트에도 안 맞는 주소일 때.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-archivo text-5xl font-extrabold text-primary-tint-strong">
        404
      </p>

      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요.</h1>

      <p className="text-sm text-muted-foreground">
        주소가 잘못됐거나 사라진 페이지입니다.
      </p>

      <Link
        href="/"
        className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {SITE.name} 대시보드로
      </Link>
    </main>
  );
}
