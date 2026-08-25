import Link from "next/link";

import { brews } from "@/libs/mocks/brews";

export default function BrewsLayout({ children, detail }: LayoutProps<"/brews">) {
  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex w-full items-center justify-between border-b border-border-foreground px-4 py-2">
        <div>
          <div className="font-archivo text-xs text-muted-foreground">
            /BREWS · 전체 {brews.length}건
          </div>

          <h1 className="text-2xl font-bold">기록</h1>
        </div>

        <Link
          href="/brews/new"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          기록 추가
        </Link>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.15fr]">
        {children}

        <div className="min-h-0 overflow-y-auto">{detail}</div>
      </div>
    </main>
  );
}
