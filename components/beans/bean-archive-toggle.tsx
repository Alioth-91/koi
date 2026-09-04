"use client";

import { updateBeanArchived } from "@/app/(main)/(private)/beans/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  archived: boolean;
  beanId: string;
};

export default function BeanArchiveToggle({ archived, beanId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function handleClick() {
    setErrorMessage("");

    startTransition(async () => {
      const result = await updateBeanArchived({
        archived: !archived,
        beanId,
      });

      if (result.errorMessage) {
        setErrorMessage(result.errorMessage);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        aria-pressed={archived}
        className="rounded-xl border border-border-foreground px-3 py-2 text-xs font-bold text-subtle-foreground transition-colors hover:border-primary-hover hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="button"
        onClick={handleClick}
      >
        {isPending
          ? "변경 중..."
          : archived
            ? "보유 중으로 되돌리기"
            : "모두 사용함"}
      </button>
      <p
        aria-live="polite"
        className="min-h-4 max-w-40 text-right text-xs text-destructive"
      >
        {errorMessage}
      </p>
    </div>
  );
}
