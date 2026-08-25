"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn, formatDate } from "@/libs/utils";
import { Brew } from "@/types/brew";

type Props = {
  brews: Brew[];
};

export default function BrewList({ brews }: Props) {
  const pathName = usePathname();

  return (
    <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto border-r border-border-foreground p-3">
      {brews.map((brew) => (
        <li key={brew.id}>
          <Link
            aria-current={pathName === `/brews/${brew.id}` ? "page" : undefined}
            href={`/brews/${brew.id}`}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3.5 py-3 transition hover:bg-primary-tint",
              pathName === `/brews/${brew.id}` && "bg-primary-tint",
            )}
          >
            <span className="min-w-0 flex-1">
              <time
                dateTime={brew.date}
                className="block text-[11px] text-muted-foreground"
              >
                {formatDate(brew.date)}
              </time>

              <span className="mt-0.5 block truncate font-bold">
                {brew.type === "home" ? brew.beanName : brew.cafeName}
              </span>

              <span className="mt-0.5 block min-h-4 truncate text-xs text-subtle-foreground">
                {summarize(brew)}
              </span>
            </span>

            <span className="font-archivo text-2xl font-extrabold">
              <span className="sr-only">총점 </span>
              {brew.score}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * 커피 상세 정보를 한 줄로 요약하는 함수 : 빈 값을 걸러낸 뒤 join(" · ")으로 반환한다.
 *
 * @example
 *   summarize({ type: "home", methods: "핸드드립", dose: 18, water: 150 }) // "핸드드립 · 18g/150g"
 */
function summarize(brew: Brew) {
  // 카페 커피일 경우 메뉴, 온도, 가격을 반환한다.
  if (brew.type === "cafe") {
    return [
      brew.menu,
      brew.temperature?.toUpperCase(),
      brew.price && `${brew.price.toLocaleString()}원`,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const amount = [brew.dose && `${brew.dose}g`, brew.water && `${brew.water}g`]
    .filter(Boolean)
    .join("/");

  return [brew.method, amount, brew.time].filter(Boolean).join(" · ");
}
