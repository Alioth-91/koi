import type { ComponentProps } from "react";

import { formatScore } from "@/libs/utils";

type Props = ComponentProps<"input"> & {
  value: number;
};

/**
 * 총점 — 0.5 단위 슬라이더
 *
 * range는 "안 고름"을 표현할 수 없다(손잡이가 늘 어딘가에 있다).
 * 그래서 초기값이 0이고, 건드리지 않으면 0점으로 저장된다.
 *
 * RHF와는 무관한 부품이다 — 폼이 register 결과를 펴서 넘긴다.
 */
export default function ScoreField({ value, ...input }: Props) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between">
        <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
          총점
        </span>

        <span className="font-archivo text-[22px] font-extrabold">
          {formatScore(value)}
        </span>
      </span>

      <input
        className="w-full accent-primary"
        max={5}
        min={0}
        step={0.5}
        type="range"
        {...input}
      />
    </label>
  );
}
