"use client";

import { deleteBrew } from "@/app/(main)/(private)/brews/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Modal from "@/components/modal";

type BrewDeleteModalProps = {
  brewId: string;
};

export default function BrewDeleteModal({ brewId }: BrewDeleteModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function close() {
    setIsOpen(false);
  }

  function open() {
    setErrorMessage("");
    setIsOpen(true);
  }

  function handleDelete() {
    setErrorMessage("");

    startTransition(async () => {
      const result = await deleteBrew({ brewId });

      if (result.errorMessage) {
        setErrorMessage(result.errorMessage);
        return;
      }

      router.replace("/brews");
    });
  }

  return (
    <>
      <button
        className="shrink-0 rounded-xl border border-border-foreground px-3 py-2 text-xs font-bold text-destructive transition-colors hover:border-destructive hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
        onClick={open}
        type="button"
      >
        삭제
      </button>

      <Modal
        className="w-[calc(100%-2rem)] max-w-md"
        fullHeight={false}
        isOpen={isOpen}
        onClose={close}
        title="이 기록을 삭제할까요?"
      >
        <div className="flex flex-col">
          <section className="px-4 py-4 text-sm leading-relaxed text-subtle-foreground">
            <p>삭제한 기록은 다시 복구할 수 없어요.</p>

            <p className="mt-3">정말 삭제할까요?</p>

            <p aria-live="polite" className="mt-3 min-h-5 text-destructive">
              {errorMessage}
            </p>
          </section>

          <footer className="flex justify-end gap-4 bg-background px-6 py-4">
            <button
              className="cursor-pointer rounded-xl border border-border-foreground px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint"
              disabled={isPending}
              onClick={close}
              type="button"
            >
              취소
            </button>

            <button
              className="cursor-pointer rounded-xl bg-destructive px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={handleDelete}
              type="button"
            >
              {isPending ? "삭제 중..." : "삭제"}
            </button>
          </footer>
        </div>
      </Modal>
    </>
  );
}
