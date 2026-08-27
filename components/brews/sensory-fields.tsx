import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/libs/utils";

const AXES = [
  ["acidity", "산미", "bg-acidity"],
  ["sweetness", "단맛", "bg-sweetness"],
  ["bitterness", "쓴맛", "bg-bitterness"],
  ["body", "바디", "bg-body"],
  ["aftertaste", "여운", "bg-aftertaste"],
] as const;

const SCORES = [1, 2, 3, 4, 5];

type Axis = (typeof AXES)[number][0];

type Props = {
  register: (name: `sensory.${Axis}`) => UseFormRegisterReturn;
  // unknown인 이유: 스키마가 z.coerce.number()라 입력 타입이 좁혀지지 않는다.
  values: Partial<Record<Axis, unknown>> | undefined;
};

/**
 * 센서리 5축 — 산미, 단맛, 쓴맛, 바디, 여운
 */
export default function SensoryFields({ register, values }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[11px] tracking-widest text-muted-foreground uppercase">
        센서리
      </h3>

      {AXES.map(([key, label, color]) => {
        // 라디오 값은 문자열("3")로 온다.
        const currentScore = Number(values?.[key]) || 0;

        return (
          <div className="flex items-center gap-3" key={key}>
            <span className="w-8 shrink-0 text-xs text-subtle-foreground">
              {label}
            </span>

            {/* name이 같은 라디오는 브라우저가 한 묶음으로 묶어 화살표 키 이동을 준다. */}
            <div
              aria-label={label}
              className="flex flex-1 gap-0.5"
              role="radiogroup"
            >
              {SCORES.map((score) => (
                <label className="flex-1 cursor-pointer" key={score}>
                  <input
                    className="peer sr-only"
                    type="radio"
                    value={score}
                    {...register(`sensory.${key}`)}
                  />

                  <span
                    className={cn(
                      "block h-3.5 rounded-full bg-primary-tint transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-foreground",
                      score <= currentScore && color,
                    )}
                  />
                </label>
              ))}
            </div>

            <span className="w-3 shrink-0 text-right font-archivo text-xs font-extrabold text-muted-foreground">
              {currentScore || ""}
            </span>

            <label
              className="shrink-0 cursor-pointer"
              title={`${label} 지우기`}
            >
              <input
                className="peer sr-only"
                type="radio"
                value=""
                {...register(`sensory.${key}`)}
              />

              {!!currentScore && (
                <span className="block rounded-full px-1 text-xs text-placeholder transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-foreground hover:text-foreground">
                  ✕
                </span>
              )}
            </label>
          </div>
        );
      })}
    </div>
  );
}
