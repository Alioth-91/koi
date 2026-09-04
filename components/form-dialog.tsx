"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";

import NewBeanForm from "@/components/beans/new-bean-form";
import NewBrewForm from "@/components/brews/new-brew-form";
import Modal from "@/components/modal";
import { BEAN_NEW_FORM_ID, BREW_NEW_FORM_ID } from "@/libs/constants/forms";

type FormConfig = {
  Body: ComponentType<FormBodyProps>;
  formId: string;
  panel: string;
  title: string;
};

type FormBodyProps = {
  onSubmitDisabledChange: (disabled: boolean) => void;
};

const NewBeanFormBody: ComponentType<FormBodyProps> = () => <NewBeanForm />;

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
    Body: NewBeanFormBody,
    panel: "md:max-w-xl",
  },
} satisfies Record<"brew" | "bean", FormConfig>;

type FormKey = keyof typeof FORMS;

type ActiveForm = (typeof FORMS)[FormKey];

/**
 * `?form=` 값은 `string | null` 이라 그대로는 FORMS를 못 찾는다.
 * true면 FormKey로 봐도 된다고 컴파일러에게 알려주는 게 `formParam is FormKey` — 타입 술어다.
 *
 * 캐스트로 넘길 수도 있지만, 그러면 `?form=xyz` 일 때 undefined를 받아놓고 타입은 멀쩡하다.
 */
function isFormKey(formParam: string | null): formParam is FormKey {
  return formParam !== null && formParam in FORMS;
}

type FormDialogContentProps = {
  activeForm: ActiveForm | null;
  close: () => void;
};

function FormDialogContent({ activeForm, close }: FormDialogContentProps) {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(
    () => activeForm?.formId === BREW_NEW_FORM_ID,
  );

  const isOpen = activeForm !== null;

  return (
    <Modal
      className={activeForm?.panel}
      isOpen={isOpen}
      onClose={close}
      title={activeForm?.title ?? ""}
    >
      {activeForm && (
        <>
          <activeForm.Body onSubmitDisabledChange={setIsSubmitDisabled} />

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
              className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitDisabled}
              form={activeForm.formId}
              type="submit"
            >
              저장
            </button>
          </footer>
        </>
      )}
    </Modal>
  );
}

/**
 * 폼 모달
 *
 * 열림/닫힘은 쿼리스트링(`?form=brew`)으로 관리한다.
 */
export default function FormDialog() {
  const formParam = useSearchParams().get("form");

  // 좁힌 키로 맵에서 꺼낸 항목. 열지 않을 때는 null이라 아래 렌더 조건도 겸한다.
  const activeForm = isFormKey(formParam) ? FORMS[formParam] : null;
  const pathname = usePathname();
  const router = useRouter();
  const close = () => router.replace(pathname as Route);

  return (
    <FormDialogContent
      activeForm={activeForm}
      close={close}
      key={formParam ?? "closed"}
    />
  );
}
