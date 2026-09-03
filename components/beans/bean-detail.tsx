import { PROCESS_BADGE, PROCESS_FALLBACK } from "@/libs/constants/beans";
import { remainingWeight } from "@/libs/beans/calculations";
import { cn, formatDate, formatScore } from "@/libs/utils";
import { Bean } from "@/types/bean";
import { HomeBrew } from "@/types/brew";
import BeanArchiveToggle from "@/components/beans/bean-archive-toggle";
import Link from "next/link";

type BeanDetailProps = {
  bean: Bean;
  homeBrews: HomeBrew[];
};

export default function BeanDetail({ bean, homeBrews }: BeanDetailProps) {
  return (
    <article className="flex flex-col gap-4 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          {bean.process && (
            <span
              className={cn(
                "w-fit rounded-full px-2.5 py-1 text-[10.5px] font-extrabold",
                PROCESS_BADGE[bean.process] ?? PROCESS_FALLBACK,
              )}
            >
              <span className="sr-only">가공 방식 </span>

              {bean.process}
            </span>
          )}

          <h2 className="truncate text-2xl font-extrabold">{bean.name}</h2>
        </div>

        <BeanArchiveToggle archived={bean.archived ?? false} beanId={bean.id} />
      </header>

      <dl className="grid grid-cols-2 gap-x-5">
        {rowsOf(bean, homeBrews).map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between border-b border-border-foreground py-2 text-xs"
          >
            <dt className="text-subtle-foreground">{label}</dt>

            <dd className="font-archivo text-sm font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] tracking-widest text-muted-foreground">
            이 원두로 내린 기록
          </h3>

          {!!homeBrews.length && (
            <Link
              href="/brews"
              className="text-[11px] tracking-widest text-muted-foreground"
            >
              전체 {homeBrews.length}건 보기
            </Link>
          )}
        </div>

        {homeBrews.length ? (
          <ul className="flex flex-col gap-2">
            {homeBrews.map((brew) => (
              <li key={brew.id}>
                <Link
                  className="flex items-center justify-between rounded-2xl border border-border-foreground px-3 py-2 text-sm text-subtle-foreground transition hover:border-primary-hover"
                  href={`/brews/${brew.id}`}
                >
                  <div className="flex gap-4">
                    <time className="tabular-nums" dateTime={brew.date}>
                      {formatDate(brew.date)}
                    </time>
                    <span>{brew.method}</span>
                  </div>

                  <span className="font-archivo font-extrabold">
                    {formatScore(brew.score)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-foreground px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              아직 이 원두로 내린 기록이 없어요
            </p>

            <Link
              href="?form=brew"
              className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              기록 추가
            </Link>
          </div>
        )}
      </section>
    </article>
  );
}

function rowsOf(bean: Bean, homeBrews: HomeBrew[]) {
  const used = homeBrews.reduce((sum, brew) => sum + (brew.dose ?? 0), 0);
  const remaining = remainingWeight(bean.weight, used);
  const avgScore = homeBrews.length
    ? formatScore(
        homeBrews.reduce((sum, brew) => sum + brew.score, 0) / homeBrews.length,
      )
    : "-";

  const entries: [string, string][] = [
    ["로스터리", bean.roastery ?? "-"],
    ["가격", bean.price ? `${bean.price.toLocaleString()}원` : "-"],
    ["구매 용량", bean.weight ? `${bean.weight.toLocaleString()}g` : "-"],
    [
      "남은 용량(추정)",
      remaining === undefined ? "-" : `${remaining.toLocaleString()}g`,
    ],
    ["로스팅 날짜", bean.roastedAt ? formatDate(bean.roastedAt) : "-"],
    ["로스팅 포인트", bean.roastLevel ?? "-"],
    ["기록", `${homeBrews.length}건`],
    ["평균 점수", avgScore],
  ];

  return entries;
}
