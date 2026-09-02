import Link from "next/link";

import BrewList from "@/components/brews/brew-list";
import BrewPanes from "@/components/brews/brew-panes";
import { listBrews } from "@/libs/db/brews";

export default async function BrewsLayout({ children }: LayoutProps<"/brews">) {
  const brews = await listBrews();

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex w-full items-center justify-between border-b border-border-foreground px-4 py-2">
        <div>
          <div className="font-archivo text-xs text-muted-foreground">
            /BREWS · 전체 {brews.length}건
          </div>

          <h1 className="text-2xl font-bold">기록</h1>
        </div>

        <Link
          href="?form=brew"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          기록 추가
        </Link>
      </header>

      {/* 목록은 레이아웃에 둔다 — 하위 라우트가 바뀌어도 다시 그려지지 않는다. */}
      <BrewPanes list={<BrewList brews={brews} />} detail={children} />
    </main>
  );
}
