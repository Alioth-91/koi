"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import NewBeanForm from "@/components/beans/new-bean-form";
import NewBrewForm from "@/components/brews/new-brew-form";
import { BEAN_NEW_FORM_ID, BREW_NEW_FORM_ID } from "@/libs/constants/forms";
import { cn } from "@/libs/utils";

/**
 * 폼 모달
 *
 * 열림/닫힘은 쿼리스트링(`?form=brew`)으로 관리한다.
 */

const FORMS = {
  brew: {
    title: "기록 추가",
    formId: BREW_NEW_FORM_ID,
    Body: NewBrewForm,
    panel: "md:max-w-344",
  },
  bean: {
    title: "원두 등록",
    formId: BEAN_NEW_FORM_ID,
    Body: NewBeanForm,
    panel: "md:max-w-xl",
  },
} as const;

/** <dialog aria-labelledby> 가 가리킬 제목. 열려 있는 폼이 하나뿐이라 상수로 둔다. */
const TITLE_ID = "form-dialog-title";

type FormKey = keyof typeof FORMS;

/**
 * `?form=` 값은 `string | null` 이라 그대로는 FORMS를 못 찾는다.
 * true면 FormKey로 봐도 된다고 컴파일러에게 알려주는 게 `formParam is FormKey` — 타입 술어다.
 *
 * 캐스트로 넘길 수도 있지만, 그러면 `?form=xyz` 일 때 undefined를 받아놓고 타입은 멀쩡하다.
 */
function isFormKey(formParam: string | null): formParam is FormKey {
  return formParam !== null && formParam in FORMS;
}

export default function FormDialog() {
  const formParam = useSearchParams().get("form");

  // 좁힌 키로 맵에서 꺼낸 항목. 열지 않을 때는 null이라 아래 렌더 조건도 겸한다.
  const activeForm = isFormKey(formParam) ? FORMS[formParam] : null;
  const isOpen = activeForm !== null;
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  const close = () => router.replace(pathname as Route);

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
      aria-labelledby={TITLE_ID}
      className={cn(
        "m-auto h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-background backdrop:bg-overlay md:max-h-4/5 md:w-[calc(100%-4rem)] md:rounded-2xl",
        activeForm?.panel,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}

      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      ref={ref}
    >
      {activeForm && (
        <div className="flex min-h-full flex-col">
          <header className="flex items-center justify-between p-4">
            <h2 className="text-lg font-extrabold" id={TITLE_ID}>
              {activeForm.title}
            </h2>

            <button
              aria-label="닫기"
              className="rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-primary-tint"
              onClick={close}
              type="button"
            >
              ✕
            </button>
          </header>

          <activeForm.Body />

          {/* mt-auto — 폼이 짧아도 바닥에 붙는다. sticky — 길어지면 스크롤 위에 떠 있는다.
            저장은 <form> 밖이라 form 속성으로 잇는다. */}
          <footer className="sticky bottom-0 mt-auto flex justify-end gap-4 bg-background px-6 py-4">
            <button
              className="cursor-pointer rounded-xl border border-border-foreground px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary-tint"
              onClick={close}
              type="button"
            >
              취소
            </button>

            <button
              className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
              form={activeForm.formId}
              type="submit"
            >
              저장
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
