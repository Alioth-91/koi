"use client";

import type { Route } from "next";
import { useState } from "react";
import { useRouter } from "next/navigation";

import BrewFilterPanel from "@/components/brews/brew-filter-panel";
import {
  countBrewFilters,
  toBrewFilterSearchParams,
  type BrewFilters,
} from "@/libs/brews/filters";
import { cn } from "@/libs/utils";
import type { Bean } from "@/types/bean";

type Props = {
  beans: Bean[];
  filteredCount: number;
  filters: BrewFilters;
  methods: string[];
  totalCount: number;
};

type FilterKey = keyof BrewFilters;

export default function BrewFilterBar({
  beans,
  filteredCount,
  filters,
  methods,
  totalCount,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = countBrewFilters(filters);

  const replaceFilters = (nextFilters: BrewFilters) => {
    const query = toBrewFilterSearchParams(nextFilters).toString();
    const href = query ? `/brews?${query}` : "/brews";

    router.replace(href as Route);
  };

  const apply = () => {
    replaceFilters(draft.type === "cafe" ? { type: "cafe" } : draft);
    setIsOpen(false);
  };

  const reset = () => setDraft({});

  const chips = [
    filters.type && {
      key: "type" as const,
      label: filters.type === "home" ? "집" : "카페",
    },
    filters.beanId && {
      key: "beanId" as const,
      label: `원두: ${
        beans.find((bean) => bean.id === filters.beanId)?.name ?? "선택한 원두"
      }`,
    },
    filters.method && {
      key: "method" as const,
      label: `추출: ${filters.method}`,
    },
  ].filter(Boolean) as Array<{ key: FilterKey; label: string }>;

  return (
    <div className="relative shrink-0 border-b border-border-foreground px-3 py-3">
      <div className="flex items-center gap-2">
        <button
          aria-expanded={isOpen}
          className={cn(
            "rounded-xl border px-3 py-2 text-sm font-bold transition-colors",
            isOpen || activeCount
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border-foreground hover:bg-primary-tint",
          )}
          onClick={() => {
            if (!isOpen) setDraft(filters);
            setIsOpen((open) => !open);
          }}
          type="button"
        >
          필터
          {!!activeCount && (
            <span className="ml-1.5 font-archivo text-xs">{activeCount}</span>
          )}
        </button>

        <span aria-live="polite" className="text-xs text-muted-foreground">
          {activeCount
            ? `${filteredCount}건 / 전체 ${totalCount}건`
            : `전체 ${totalCount}건`}
        </span>
      </div>

      {!!chips.length && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {chips.map((chip) => (
            <button
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-tint px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-primary-tint-strong"
              key={chip.key}
              onClick={() =>
                replaceFilters({ ...filters, [chip.key]: undefined })
              }
              type="button"
            >
              {chip.label}
              <span aria-hidden="true" className="text-muted-foreground">
                ×
              </span>
              <span className="sr-only">필터 해제</span>
            </button>
          ))}

          <button
            className="shrink-0 px-2 py-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={() => replaceFilters({})}
            type="button"
          >
            전체 해제
          </button>
        </div>
      )}

      {isOpen && (
        <BrewFilterPanel
          beans={beans}
          draft={draft}
          methods={methods}
          onApply={apply}
          onChange={setDraft}
          onClose={() => setIsOpen(false)}
          onReset={reset}
        />
      )}
    </div>
  );
}
