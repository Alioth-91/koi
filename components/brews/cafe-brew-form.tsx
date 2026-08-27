"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import CafeMap from "@/components/brews/cafe-map";
import CafeSearch, { type PickedCafe } from "@/components/brews/cafe-search";
import FieldCard from "@/components/brews/field-card";
import MemoField from "@/components/brews/memo-field";
import ScoreField from "@/components/brews/score-field";
import SensoryFields from "@/components/brews/sensory-fields";
import TypeSegment from "@/components/brews/type-segment";
import { BREW_FORM_ID } from "@/libs/constants/forms";
import { today } from "@/libs/utils";
import { cafeSchema } from "@/libs/schemas/brew";
import type { Brew } from "@/types/brew";

/**
 * 카페에서 주문한 기록 작성 폼
 */
type Props = {
  onTypeChange: (type: Brew["type"]) => void;
};

export default function CafeBrewForm({ onTypeChange }: Props) {
  const [picked, setPicked] = useState<PickedCafe | null>(null);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof cafeSchema>, unknown, z.output<typeof cafeSchema>>(
    {
      resolver: zodResolver(cafeSchema),
      defaultValues: { date: today(), score: 0, type: "cafe" },
    },
  );

  const price = Number(useWatch({ control, name: "price" }));
  const score = useWatch({ control, name: "score" }) ?? 0;
  const sensory = useWatch({ control, name: "sensory" });

  const spent = price > 0 ? `${price.toLocaleString("ko-KR")}원` : "—";

  return (
    <form
      className="flex-1 md:grid md:grid-cols-[1fr_1fr]"
      id={BREW_FORM_ID}
      onSubmit={handleSubmit((values) => console.log(values))}
    >
      <div className="flex min-w-0 flex-col gap-2.5 p-6">
        <TypeSegment onChange={onTypeChange} value="cafe" />

        <FieldCard
          error={errors.cafeName?.message}
          label="카페"
          placeholder="프릳츠 서울"
          {...register("cafeName")}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <FieldCard
            error={errors.date?.message}
            label="날짜"
            type="date"
            {...register("date")}
          />

          <FieldCard
            label="메뉴"
            placeholder="아메리카노"
            {...register("menu")}
          />

          <FieldCard
            label="가격 (원)"
            placeholder="4500"
            type="number"
            {...register("price")}
          />

          <label className="flex flex-col rounded-2xl border border-border-foreground px-4 py-3.5">
            <span className="text-[11px] text-muted-foreground">잔</span>

            <select
              className="mt-0.5 bg-transparent text-base font-extrabold outline-none"
              {...register("temperature")}
            >
              <option value="">선택 안 함</option>
              <option value="hot">HOT</option>
              <option value="iced">ICED</option>
            </select>
          </label>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2.5">
          <div className="flex items-baseline justify-between rounded-[18px] bg-primary px-4.5 py-4 text-primary-foreground">
            <span className="text-[11px] tracking-widest uppercase opacity-85">
              지출
            </span>

            <span className="font-archivo text-[22px] font-extrabold">
              {spent}
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
          카페 찾기
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          <CafeSearch
            onSelect={(cafe) => {
              setPicked(cafe);
              setValue("cafeName", cafe.name);
              setValue("address", cafe.address);
              setValue("location", cafe.location);
            }}
          />

          <CafeMap location={picked?.location} />

          <p className="text-xs text-muted-foreground">
            {picked?.address ?? "검색해서 카페를 고르세요"}
          </p>
        </div>

        <div className="mt-6">
          <MemoField placeholder="다음에 참고할 것" {...register("memo")} />
        </div>
      </aside>
    </form>
  );
}
