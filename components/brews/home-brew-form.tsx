"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { createBrew, updateBrew } from "@/app/(main)/(private)/brews/actions";
import FieldCard from "@/components/brews/field-card";
import MemoField from "@/components/brews/memo-field";
import ScoreField from "@/components/brews/score-field";
import SensoryFields from "@/components/brews/sensory-fields";
import TypeSegment from "@/components/brews/type-segment";
import { BREW_NEW_FORM_ID } from "@/libs/constants/forms";
import { homeSchema } from "@/libs/schemas/brew";
import { today } from "@/libs/utils";
import type { Bean } from "@/types/bean";
import type { Brew } from "@/types/brew";

const HOME_FIELDS = [
  "beanId",
  "date",
  "dose",
  "method",
  "time",
  "water",
  "waterTemp",
  "score",
  "memo",
  "sensory",
] as const satisfies ReadonlyArray<keyof z.input<typeof homeSchema>>;

/**
 * 집에서 내린 기록 작성 폼
 */
type Props = {
  beanLoadState: BeanLoadState;
  beans: Bean[];
  brew?: Extract<Brew, { type: "home" }>;
  formId?: string;
  isEditing: boolean;
  onSubmitDisabledChange: (disabled: boolean) => void;
  onSuccess?: () => void;
  onTypeChange: (type: Brew["type"]) => void;
};

export type BeanLoadState = "loading" | "ready" | "error";

export default function HomeBrewForm({
  beanLoadState,
  beans,
  brew,
  formId = BREW_NEW_FORM_ID,
  isEditing,
  onSubmitDisabledChange,
  onSuccess,
  onTypeChange,
}: Props) {
  const router = useRouter();

  const {
    clearErrors,
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof homeSchema>, unknown, z.output<typeof homeSchema>>(
    {
      resolver: zodResolver(homeSchema),
      defaultValues: brew
        ? {
            beanId: brew.beanId ?? "",
            date: brew.date,
            dose: brew.dose ?? "",
            memo: brew.memo ?? "",
            method: brew.method ?? "",
            score: brew.score,
            sensory: brew.sensory,
            time: brew.time ?? "",
            type: "home",
            water: brew.water ?? "",
            waterTemp: brew.waterTemp ?? "",
          }
        : { date: today(), score: 0, type: "home" },
    },
  );

  useEffect(() => {
    onSubmitDisabledChange(isSubmitting);
  }, [isSubmitting, onSubmitDisabledChange]);

  const dose = Number(useWatch({ control, name: "dose" }));
  const water = Number(useWatch({ control, name: "water" }));
  const ratio =
    dose > 0 && water > 0 ? `1:${Math.round((water / dose) * 10) / 10}` : "—";

  const score = useWatch({ control, name: "score" }) ?? 0;

  const sensory = useWatch({ control, name: "sensory" });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root.server");

    const result = brew
      ? await updateBrew({ brewId: brew.id, ...values })
      : await createBrew(values);

    for (const field of HOME_FIELDS) {
      const message = result.errors?.[field]?.[0];

      if (message) setError(field, { type: "server", message });
    }

    if (result.errorMessage) {
      setError("root.server", {
        type: "server",
        message: result.errorMessage,
      });
    }

    if (result.errors || result.errorMessage) return;

    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
      router.replace("/brews");
    }
  });

  return (
    // 그리드를 <form> 에 건다 — 우측 패널도 폼 안이라야 register 가 닿는다.
    <form
      // flex-1 — 모달 높이가 h-4/5로 고정이라, 폼이 남는 높이를 채워야
      // 우측 패널의 세로 구분선이 바닥까지 이어진다.
      className="flex-1 md:grid md:grid-cols-[1fr_1fr]"
      id={formId}
      aria-busy={isSubmitting}
      noValidate
      onSubmit={onSubmit}
    >
      <fieldset className="contents" disabled={isSubmitting}>
        <div className="flex min-w-0 flex-col gap-2.5 p-6">
          <TypeSegment
            disabled={isEditing}
            onChange={onTypeChange}
            value="home"
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

            <FieldCard
              error={errors.time?.message}
              label="시간"
              placeholder="2:30"
              {...register("time")}
            />
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

        <aside className="min-w-0 border-t border-border-foreground p-6 md:border-t-0 md:border-l">
          <h2 className="text-xs font-semibold text-label-foreground">
            원두 선택
          </h2>

          {beanLoadState === "loading" ? (
            <div className="mt-4 rounded-2xl border border-border-foreground p-4 text-sm text-muted-foreground">
              원두 목록을 불러오는 중...
            </div>
          ) : beanLoadState === "error" ? (
            <div className="mt-4 rounded-2xl border border-border-foreground p-4 text-sm text-destructive">
              원두 목록을 불러오지 못했어요. 모달을 닫고 다시 시도해주세요.
            </div>
          ) : beans.length > 0 ? (
            <label className="mt-4 flex flex-col rounded-2xl border border-border-foreground px-4 py-3.5">
              <span className="text-[11px] text-muted-foreground">
                사용할 원두
              </span>

              <select
                className="mt-0.5 bg-transparent text-base font-extrabold outline-none"
                required
                {...register("beanId")}
              >
                <option value="">원두를 선택하세요</option>
                {beans.map((bean) => (
                  <option key={bean.id} value={bean.id}>
                    {bean.name}
                    {bean.roastery ? ` · ${bean.roastery}` : ""}
                  </option>
                ))}
              </select>

              {errors.beanId?.message && (
                <span className="mt-1 text-xs text-destructive">
                  {errors.beanId.message}
                </span>
              )}
            </label>
          ) : (
            <div className="mt-4 rounded-2xl border border-border-foreground p-4">
              <p className="text-sm text-muted-foreground">
                등록한 원두가 없어요. 먼저 원두를 등록해주세요.
              </p>

              <Link
                className="mt-3 inline-block rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                href="?form=bean"
              >
                원두 등록하기
              </Link>
            </div>
          )}

          <div className="mt-6">
            <MemoField
              placeholder="다음에 참고할 것 또는 느낀점을 적어보세요."
              {...register("memo")}
            />
          </div>

          <p aria-live="polite" className="min-h-5 text-sm text-destructive">
            {isSubmitting
              ? "기록을 저장하는 중..."
              : errors.root?.server?.message}
          </p>
        </aside>
      </fieldset>
    </form>
  );
}
