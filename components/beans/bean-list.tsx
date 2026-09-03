"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { daysSinceRoast } from "@/libs/beans/calculations";
import { cn } from "@/libs/utils";
import type { Bean } from "@/types/bean";

type Props = {
  beans: Bean[];
};

export default function BeanList({ beans }: Props) {
  const pathName = usePathname();

  if (!beans.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border-r border-border-foreground p-6 text-center">
        <p className="text-muted-foreground">아직 등록한 원두가 없어요</p>

        <Link
          href="?form=bean"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          첫 원두 등록하기
        </Link>
      </div>
    );
  }

  const activeBeans = beans.filter((bean) => !bean.archived);
  const archivedBeans = beans.filter((bean) => bean.archived);

  return (
    <ul
      aria-label="원두 목록"
      className="relative flex min-h-0 flex-col gap-2 overflow-y-auto border-r border-border-foreground p-3"
    >
      {activeBeans.map((bean) => (
        <BeanListItem key={bean.id} bean={bean} pathName={pathName} />
      ))}

      {archivedBeans.length > 0 && (
        <li className="pt-3">
          <h2 className="border-t border-border-foreground px-3.5 pt-3 text-[11px] font-semibold tracking-wide text-muted-foreground">
            다 사용한 원두
          </h2>
        </li>
      )}

      {archivedBeans.map((bean) => (
        <BeanListItem key={bean.id} bean={bean} pathName={pathName} />
      ))}
    </ul>
  );
}

function BeanListItem({ bean, pathName }: { bean: Bean; pathName: string }) {
  const isActive = pathName === `/beans/${bean.id}`;
  const isArchived = Boolean(bean.archived);
  const roastDays = daysSinceRoast(bean.roastedAt);

  return (
    <li>
      <Link
        aria-current={isActive ? "page" : undefined}
        href={`/beans/${bean.id}`}
        className={cn(
          "flex items-center gap-3 rounded-2xl px-3.5 py-3 transition hover:bg-primary-tint focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-hidden",
          isActive && "bg-primary-tint",
          isArchived && "opacity-60",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="mt-0.5 flex items-center gap-2 font-bold">
            <span className="truncate">{bean.name}</span>

            {isArchived && (
              <span className="shrink-0 rounded-full bg-primary-tint px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                소진
              </span>
            )}
          </span>

          <span className="mt-0.5 block min-h-4 truncate text-xs text-subtle-foreground">
            {summarize(bean)}
          </span>
        </span>

        {roastDays !== undefined && (
          <span className="font-archivo font-extrabold">
            <span className="sr-only">볶은 후 지난 일수 </span>
            {`D+${String(roastDays).padStart(2, "0")}`}
          </span>
        )}
      </Link>
    </li>
  );
}

/**
 * 원두 한 줄 요약 : 빈 값을 걸러낸 뒤 join(" · ")으로 반환한다.
 *
 * @example
 *   summarize({ name: "케냐 AA", roastery: "앤트러사이트", process: "워시드", roastedAt: "2026-08-11" })
 *   // "앤트러사이트 · 워시드"
 */
function summarize(bean: Bean) {
  return [bean.roastery, bean.process].filter(Boolean).join(" · ");
}
