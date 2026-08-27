"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import FieldCard from "@/components/brews/field-card";
import MemoField from "@/components/brews/memo-field";
import ScoreField from "@/components/brews/score-field";
import SensoryFields from "@/components/brews/sensory-fields";
import TypeSegment from "@/components/brews/type-segment";
import { BREW_FORM_ID } from "@/libs/constants/forms";
import { today } from "@/libs/utils";
import { homeSchema } from "@/libs/schemas/brew";
import type { Brew } from "@/types/brew";

/**
 * 집에서 내린 기록 작성 폼
 */
type Props = {
  onTypeChange: (type: Brew["type"]) => void;
};

export default function HomeBrewForm({ onTypeChange }: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof homeSchema>, unknown, z.output<typeof homeSchema>>(
    {
      resolver: zodResolver(homeSchema),
      defaultValues: { date: today(), score: 0, type: "home" },
    },
  );

  const dose = Number(useWatch({ control, name: "dose" }));
  const water = Number(useWatch({ control, name: "water" }));
  const ratio =
    dose > 0 && water > 0 ? `1:${Math.round((water / dose) * 10) / 10}` : "—";

  const score = useWatch({ control, name: "score" }) ?? 0;

  const sensory = useWatch({ control, name: "sensory" });

  return (
    // 그리드를 <form> 에 건다 — 우측 패널도 폼 안이라야 register 가 닿는다.
    <form
      // flex-1 — 모달 높이가 h-4/5로 고정이라, 폼이 남는 높이를 채워야
      // 우측 패널의 세로 구분선이 바닥까지 이어진다.
      className="flex-1 md:grid md:grid-cols-[1fr_1fr]"
      id={BREW_FORM_ID}
      onSubmit={handleSubmit((values) => console.log(values))}
    >
      <div className="flex min-w-0 flex-col gap-2.5 p-6">
        <TypeSegment onChange={onTypeChange} value="home" />

        {/* TODO(나): S3에서 선택 카드로 바뀐다 — 누르면 우측 패널에서 보유 원두를 고른다. */}
        <FieldCard
          error={errors.beanName?.message}
          label="원두"
          placeholder="에티오피아 예가체프"
          {...register("beanName")}
        />

        {/* 시안 기준 2열. 좁은 화면에서도 2열을 유지한다 — 칸이 짧아 한 줄에 둘이 들어간다. */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldCard
            error={errors.date?.message}
            label="날짜"
            type="date"
            {...register("date")}
          />

          <FieldCard
            label="추출 방법"
            placeholder="V60"
            {...register("method")}
          />

          <FieldCard
            label="원두량 (g)"
            placeholder="15"
            type="number"
            {...register("dose")}
          />

          <FieldCard
            label="물 (g)"
            placeholder="240"
            type="number"
            {...register("water")}
          />

          <FieldCard
            label="물 온도 (℃)"
            placeholder="93"
            type="number"
            {...register("waterTemp")}
          />

          <FieldCard label="시간" placeholder="2:30" {...register("time")} />
        </div>

        {/* 파생값(저장 안 함)과 총점을 한 줄에 — 둘 다 "결과"라 나란히 읽힌다. */}
        <div className="mt-1 grid grid-cols-2 gap-2.5">
          <div className="flex items-center justify-between rounded-[18px] bg-primary px-4.5 py-4 text-primary-foreground">
            <span className="text-[11px] tracking-widest uppercase opacity-85">
              비율
            </span>

            <span className="font-archivo text-[22px] font-extrabold">
              {ratio}
            </span>
          </div>

          <div className="rounded-[18px] border border-border-foreground px-4.5 py-4">
            <ScoreField
              value={score}
              {...register("score", { valueAsNumber: true })}
            />
          </div>
        </div>

        <SensoryFields register={register} values={sensory} />
      </div>

      <aside className="hidden min-w-0 border-l border-border-foreground p-6 md:block">
        <h2 className="text-xs font-semibold text-label-foreground">
          원두 선택
        </h2>

        <div className="mt-6">
          <MemoField
            placeholder="다음에 참고할 것 또는 느낀점을 적어보세요."
            {...register("memo")}
          />
        </div>

        {/* TODO(나): 원두 선택 · 지도는 그 뒤. */}
      </aside>
    </form>
  );
}
