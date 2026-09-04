"use client";

import { useEffect, useId } from "react";

import { cn } from "@/libs/utils";
import type { BrewFilters } from "@/libs/brews/filters";
import type { Bean } from "@/types/bean";

type Props = {
  beans: Bean[];
  draft: BrewFilters;
  methods: string[];
  onApply: () => void;
  onChange: (filters: BrewFilters) => void;
  onClose: () => void;
  onReset: () => void;
};

const TYPE_OPTIONS: Array<{ label: string; value: BrewFilters["type"] }> = [
  { label: "전체", value: undefined },
  { label: "집", value: "home" },
  { label: "카페", value: "cafe" },
];

export default function BrewFilterPanel({
  beans,
  draft,
  methods,
  onApply,
  onChange,
  onClose,
  onReset,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const content = (headingId: string) => (
    <>
      <header className="flex items-center justify-between border-b border-border-foreground px-5 py-4">
        <h2 className="font-bold" id={headingId}>
          필터
        </h2>

        <button
          aria-label="필터 닫기"
          className="rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-primary-tint"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-label-foreground">
            기록 유형
          </legend>

          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                aria-pressed={draft.type === option.value}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-bold transition-colors",
                  draft.type === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-foreground hover:bg-primary-tint",
                )}
                key={option.label}
                onClick={() =>
                  onChange({
                    ...draft,
                    beanId: option.value === "cafe" ? undefined : draft.beanId,
                    method: option.value === "cafe" ? undefined : draft.method,
                    type: option.value,
                  })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {draft.type !== "cafe" && (
          <>
            <label className="flex flex-col rounded-2xl border border-border-foreground px-4 py-3">
              <span className="text-[11px] text-muted-foreground">원두</span>

              <select
                className="mt-0.5 bg-transparent text-sm font-bold outline-none"
                onChange={(event) =>
                  onChange({
                    ...draft,
                    beanId: event.target.value || undefined,
                  })
                }
                value={draft.beanId ?? ""}
              >
                <option value="">모든 원두</option>
                {draft.beanId &&
                  !beans.some((bean) => bean.id === draft.beanId) && (
                    <option value={draft.beanId}>선택한 원두</option>
                  )}
                {beans.map((bean) => (
                  <option key={bean.id} value={bean.id}>
                    {bean.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col rounded-2xl border border-border-foreground px-4 py-3">
              <span className="text-[11px] text-muted-foreground">
                추출 방식
              </span>

              <select
                className="mt-0.5 bg-transparent text-sm font-bold outline-none"
                disabled={!methods.length}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    method: event.target.value || undefined,
                  })
                }
                value={draft.method ?? ""}
              >
                <option value="">
                  {methods.length ? "모든 추출 방식" : "등록된 방식 없음"}
                </option>
                {draft.method && !methods.includes(draft.method) && (
                  <option value={draft.method}>선택한 방식</option>
                )}
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <footer className="flex justify-end gap-2 border-t border-border-foreground px-5 py-4">
        <button
          className="rounded-xl border border-border-foreground px-4 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint"
          onClick={onReset}
          type="button"
        >
          초기화
        </button>

        <button
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          onClick={onApply}
          type="button"
        >
          적용
        </button>
      </footer>
    </>
  );

  return (
    <>
      <button
        aria-label="필터 닫기"
        className="fixed inset-0 z-20 hidden md:block"
        onClick={onClose}
        type="button"
      />

      <button
        aria-label="필터 닫기"
        className="fixed inset-0 z-40 bg-overlay md:hidden"
        onClick={onClose}
        type="button"
      />

      <section
        aria-labelledby={`${titleId}-desktop`}
        aria-modal="true"
        className="absolute top-full left-3 z-30 mt-2 hidden w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border-foreground bg-background shadow-card md:block"
        role="dialog"
      >
        {content(`${titleId}-desktop`)}
      </section>

      <section
        aria-labelledby={`${titleId}-mobile`}
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-background shadow-sheet md:hidden"
        role="dialog"
      >
        {content(`${titleId}-mobile`)}
      </section>
    </>
  );
}
