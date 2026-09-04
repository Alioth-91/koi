"use client";

import { cn } from "@/libs/utils";
import type { Brew } from "@/types/brew";

const TYPES = [
  { value: "home", label: "집" },
  { value: "cafe", label: "카페" },
] as const;

type Props = {
  disabled?: boolean;
  onChange: (type: Brew["type"]) => void;
  value: Brew["type"];
};

/**
 * 집 · 카페 세그먼트 — 옅은 트랙 위에 선택된 칸만 흰 pill로 떠오른다 (시안 기준).
 *
 * 폼 안에 있지만 제출과 무관하다 — type="button"이라 눌러도 submit이 발생하지 않는다.
 */
export default function TypeSegment({ disabled, onChange, value }: Props) {
  return (
    <div className="flex gap-1.5 rounded-2xl bg-primary-tint p-1">
      {TYPES.map((item) => (
        <button
          aria-pressed={value === item.value}
          className={cn(
            "h-10.5 flex-1 cursor-pointer rounded-xl text-sm font-extrabold text-muted-foreground transition-colors",
            value === item.value && "bg-background text-foreground shadow-card",
            disabled && "cursor-not-allowed opacity-60",
          )}
          disabled={disabled}
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
