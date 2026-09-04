"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import NewBrewForm from "@/components/brews/new-brew-form";
import Modal from "@/components/modal";
import { BREW_EDIT_FORM_ID } from "@/libs/constants/forms";
import type { Brew } from "@/types/brew";

type BrewEditModalProps = {
  brew: Brew;
};

export default function BrewEditModal({ brew }: BrewEditModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  function close() {
    setIsOpen(false);
  }

  function open() {
    setIsSubmitDisabled(false);
    setIsOpen(true);
  }

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        className="rounded-xl border border-border-foreground px-3 py-2 text-xs font-bold text-subtle-foreground transition-colors hover:border-primary-hover hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={open}
        type="button"
      >
        수정
      </button>

      <Modal
        className="md:max-w-344"
        isOpen={isOpen}
        onClose={close}
        title="기록 수정"
      >
        {isOpen && (
          <>
            <NewBrewForm
              brew={brew}
              formId={BREW_EDIT_FORM_ID}
              onSubmitDisabledChange={setIsSubmitDisabled}
              onSuccess={handleSuccess}
            />

            <footer className="sticky bottom-0 mt-auto flex justify-end gap-4 bg-background px-6 py-4">
              <button
                className="cursor-pointer rounded-xl border border-border-foreground px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint"
                onClick={close}
                type="button"
              >
                취소
              </button>

              <button
                className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitDisabled}
                form={BREW_EDIT_FORM_ID}
                type="submit"
              >
                {isSubmitDisabled ? "저장 중..." : "저장"}
              </button>
            </footer>
          </>
        )}
      </Modal>
    </>
  );
}
