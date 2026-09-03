import CafeStaticMap from "@/components/brews/cafe-static-map";
import { cupCost } from "@/libs/beans/calculations";
import { cn, formatDate, formatScore } from "@/libs/utils";
import type { Bean } from "@/types/bean";
import type { Brew } from "@/types/brew";

const SENSORY = [
  ["acidity", "산미", "bg-acidity"],
  ["sweetness", "단맛", "bg-sweetness"],
  ["bitterness", "쓴맛", "bg-bitterness"],
  ["body", "바디", "bg-body"],
  ["aftertaste", "여운", "bg-aftertaste"],
] as const;

type BrewDetailProps = {
  bean: Bean | null;
  brew: Brew;
};

export default function BrewDetail({ bean, brew }: BrewDetailProps) {
  const bars = SENSORY.map(([key, label, color]) => ({
    label,
    color,
    value: brew.sensory[key],
  }));
  return (
    <article className="flex flex-col gap-4 p-6">
      <header>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10.5px] font-extrabold",
            brew.type === "home"
              ? "bg-badge-home text-badge-home-foreground"
              : "bg-badge-cafe text-badge-cafe-foreground",
          )}
        >
          {brew.type === "home" ? "집" : "카페"}
        </span>

        <h2 className="mt-2 text-2xl font-extrabold">
          {brew.type === "home" ? brew.beanName : brew.cafeName}
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(brew.date)}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-5">
        {rowsOf(brew, bean).map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between border-b border-border-foreground py-2 text-xs"
          >
            <dt className="text-subtle-foreground">{label}</dt>

            <dd className="font-archivo text-sm font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h3 className="mb-2.5 text-[11px] tracking-widest text-muted-foreground">
          센서리
        </h3>

        {bars.map((bar) => (
          <div key={bar.label} className="mb-2 flex items-center gap-3">
            <span className="w-8 shrink-0 text-xs text-subtle-foreground">
              {bar.label}
            </span>

            <span className="h-1.5 flex-1 rounded-full bg-primary-tint">
              <span
                className={`block h-full rounded-full ${bar.color}`}
                style={{ width: `${bar.value * 20}%` }}
              />
            </span>

            <span
              className={cn(
                "font-archivo text-xs font-extrabold",
                !bar.value && "text-placeholder",
              )}
            >
              {bar.value}
            </span>
          </div>
        ))}
      </section>

      {brew.memo && (
        <section className="rounded-2xl bg-primary-tint p-4">
          <h3 className="text-[11px] tracking-widest text-muted-foreground">
            메모
          </h3>

          <p className="text-sm leading-relaxed whitespace-pre-line text-subtle-foreground">
            {brew.memo}
          </p>
        </section>
      )}

      {brew.type === "cafe" && brew.location && (
        <CafeStaticMap cafeName={brew.cafeName} location={brew.location} />
      )}

      <p className="flex items-baseline justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground">
        <span className="text-[11px] tracking-widest opacity-85">총점</span>
        <span className="font-archivo text-3xl font-extrabold">
          {formatScore(brew.score)}
        </span>
      </p>
    </article>
  );
}

// 빈 항목은 행째 빠진다.
function rowsOf(brew: Brew, bean: Bean | null) {
  const entries: [string, string | undefined][] =
    brew.type === "home"
      ? [
          ["추출 방식", brew.method],
          ["비율", ratioOf(brew.dose, brew.water)],
          ["원두", brew.dose ? `${brew.dose}g` : undefined],
          ["물", brew.water ? `${brew.water}g` : undefined],
          ["시간", brew.time],
          ["한 잔 원가", cupCostLabel(bean, brew.dose)],
        ]
      : [
          ["메뉴", brew.menu],
          ["가격", brew.price ? `${brew.price.toLocaleString()}원` : undefined],
          ["잔", brew.temperature?.toUpperCase()],
        ];

  return entries.filter(([, value]) => value);
}

function cupCostLabel(bean: Bean | null, dose?: number) {
  const cost = cupCost(bean?.price, bean?.weight, dose);

  return cost === undefined
    ? undefined
    : `${Math.round(cost).toLocaleString("ko-KR")}원`;
}

// 저장하지 않고 두 값에서 계산한다.
function ratioOf(dose?: number, water?: number) {
  if (!dose || !water) return undefined;

  return `1:${(water / dose).toFixed(1).replace(/\.0$/, "")}`;
}
