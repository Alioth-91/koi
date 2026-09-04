"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { parseBrewFilters, withBrewFilters } from "@/libs/brews/filters";
import { cn } from "@/libs/utils";

type Props = {
  list: ReactNode;
  detail: ReactNode;
};

/**
 * 목록 · 상세 두 칸의 배치
 *
 * md 이상은 2단, 미만은 한 번에 한 칸
 */
export default function BrewPanes({ list, detail }: Props) {
  // /brews면 목록만, /brews/1이면 상세만 (md 미만에서).
  const hasDetail = usePathname() !== "/brews";
  const backHref = withBrewFilters(
    "/brews",
    parseBrewFilters(useSearchParams()),
  );

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_1.15fr]">
      {/* grid — 자식 <ul>이 칸을 꽉 채워야 overflow-y-auto가 먹는다. */}
      <div className={cn("grid min-h-0", hasDetail && "hidden md:grid")}>
        {list}
      </div>

      <div
        className={cn(
          "min-h-0 overflow-y-auto",
          !hasDetail && "hidden md:block",
        )}
      >
        <Link
          href={backHref as Route}
          className="block px-4 pt-4 text-sm text-muted-foreground md:hidden"
        >
          ← 기록
        </Link>

        {detail}
      </div>
    </div>
  );
}
