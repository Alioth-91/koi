"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import NewBeanForm from "@/components/beans/new-bean-form";
import Modal from "@/components/modal";
import { BEAN_EDIT_FORM_ID } from "@/libs/constants/forms";
import type { Bean } from "@/types/bean";

type BeanEditModalProps = {
  bean: Bean;
};

export default function BeanEditModal({ bean }: BeanEditModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  function close() {
    if (isSubmitDisabled) return;

    setIsOpen(false);
  }

  function open() {
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
        className="md:max-w-xl"
        isOpen={isOpen}
        onClose={close}
        title="원두 수정"
      >
        {isOpen && (
          <>
            <NewBeanForm
              bean={bean}
              formId={BEAN_EDIT_FORM_ID}
              onSubmitDisabledChange={setIsSubmitDisabled}
              onSuccess={handleSuccess}
            />

            <footer className="sticky bottom-0 mt-auto flex justify-end gap-4 bg-background px-6 py-4">
              <button
                className="cursor-pointer rounded-xl border border-border-foreground px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitDisabled}
                onClick={close}
                type="button"
              >
                취소
              </button>

              <button
                className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitDisabled}
                form={BEAN_EDIT_FORM_ID}
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
