"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
export default function BeanPanes({ list, detail }: Props) {
  const hasDetail = usePathname() !== "/beans";

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_1.15fr]">
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
          href="/beans"
          className="block px-4 pt-4 text-sm text-muted-foreground md:hidden"
        >
          ← 원두
        </Link>

        {detail}
      </div>
    </div>
  );
}
