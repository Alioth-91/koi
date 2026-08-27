import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  error?: string;
  label: string;
};

/**
 * 시안의 입력 카드 한 장 — 라벨 위, 값 아래.
 */
export default function FieldCard({ error, label, ...input }: Props) {
  return (
    <label className="flex flex-col rounded-2xl border border-border-foreground px-4 py-3.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>

      <input
        className="mt-0.5 bg-transparent text-base font-extrabold outline-none placeholder:font-normal placeholder:text-placeholder"
        {...input}
      />

      {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
    </label>
  );
}
