"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

import { cn } from "@/libs/utils";

type ModalProps = {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

/**
 * 대화상자의 공통 동작만 담당한다. 폼·확인 버튼 같은 내용은 호출자가 결정한다.
 */
export default function Modal({
  children,
  className,
  fullHeight = true,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const sizeClassName = fullHeight
    ? "h-dvh max-h-none md:max-h-4/5"
    : "h-fit max-h-[calc(100dvh-2rem)]";

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();

    const locked = [document.documentElement, document.body];

    for (const el of locked) {
      el.classList.toggle("overflow-hidden", isOpen);
      el.classList.toggle("overscroll-none", isOpen);
    }

    return () => {
      for (const el of locked) {
        el.classList.remove("overflow-hidden", "overscroll-none");
      }
    };
  }, [isOpen]);

  return (
    <dialog
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-full max-w-none overflow-y-auto overscroll-contain bg-background backdrop:bg-overlay md:w-[calc(100%-4rem)] md:rounded-2xl",
        !fullHeight && "rounded-2xl",
        sizeClassName,
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      ref={ref}
    >
      <div className={cn("flex flex-col", fullHeight && "min-h-full")}>
        <header className="flex items-center justify-between p-4">
          <h2 className="text-lg font-extrabold" id={titleId}>
            {title}
          </h2>

          <button
            aria-label="닫기"
            className="rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-primary-tint"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>

        {children}
      </div>
    </dialog>
  );
}
