"use client";

import { useState } from "react";

import Modal from "@/components/modal";

type BeanDeleteButtonProps = {
  beanName: string;
};

/** 삭제 액션을 연결하기 전까지는 확인 모달의 모양과 닫기 흐름만 제공한다. */
export default function BeanDeleteButton({ beanName }: BeanDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="rounded-xl border border-border-foreground px-3 py-2 text-xs font-bold text-destructive transition-colors hover:border-destructive hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        삭제
      </button>

      <Modal
        className="w-[calc(100%-2rem)] max-w-md"
        fullHeight={false}
        isOpen={isOpen}
        onClose={close}
        title="이 원두를 삭제할까요?"
      >
        <div className="flex flex-col">
          <section className="px-4 py-4 text-sm leading-relaxed text-subtle-foreground">
            <p>
              <strong className="font-bold text-foreground">{beanName}</strong>{" "}
              정보를 삭제할게요.
            </p>

            <p className="mt-3">
              삭제한 원두는 다시 복구할 수 없어요. 이 원두로 남긴 기록은 그대로
              남아요.
            </p>
          </section>

          <footer className="flex justify-end gap-4 bg-background px-6 py-4">
            <button
              className="cursor-pointer rounded-xl border border-border-foreground px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint"
              onClick={close}
              type="button"
            >
              취소
            </button>

            <button
              className="text-destructive-foreground cursor-not-allowed rounded-xl bg-destructive px-6 py-2.5 text-sm font-bold opacity-50"
              disabled
              type="button"
            >
              삭제
            </button>
          </footer>
        </div>
      </Modal>
    </>
  );
}
