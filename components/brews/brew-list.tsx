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

  if (!brews.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border-r border-border-foreground p-6 text-center">
        <p className="text-muted-foreground">아직 기록이 없어요</p>

        <Link
          href="?form=brew"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          첫 기록 추가하기
        </Link>
      </div>
    );
  }

  // relative — 안쪽 sr-only(position:absolute)의 기준을 이 <ul>로 만든다.
  // 없으면 기준이 문서가 되어 스크롤 컨테이너 밖으로 삐져나가고, 페이지에 세로 스크롤이 생긴다.
  return (
    <ul className="relative flex min-h-0 flex-col gap-2 overflow-y-auto border-r border-border-foreground p-3">
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
