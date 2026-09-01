import type { ComponentProps } from "react";

/**
 * 메모 — 여러 줄이라 <textarea>다. FieldCard는 <input> 전용이라 따로 둔다.
 *
 * 글자 크기는 FieldCard와 같은 이유로 16px(text-base) 하한을 지킨다 — iOS 확대 방지.
 * 다만 굵게 하지 않는다. 값이 아니라 문장이라서.
 */
export default function MemoField(props: ComponentProps<"textarea">) {
  return (
    <label className="flex flex-col rounded-2xl border border-border-foreground px-4 py-3.5">
      <span className="text-[11px] text-muted-foreground">메모</span>

      <textarea
        className="text-primaryoutline-none mt-0.5 resize-none bg-transparent text-base placeholder:text-placeholder"
        rows={3}
        {...props}
      />
    </label>
  );
}
