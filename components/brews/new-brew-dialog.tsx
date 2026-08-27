"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import NewBrewForm from "@/components/brews/new-brew-form";
import { BREW_FORM_ID } from "@/libs/constants/forms";

/**
 * 기록 추가 레이어
 *
 * 열림/닫힘은 주소(`?form=brew`)가 들고 있다. 전역 상태가 없어도 사이드바·헤더·목록
 * 어디서 열든 같은 곳을 본다.
 *
 * 레이아웃은 searchParams를 못 읽는다(내비게이션 때 다시 렌더되지 않아 값이 낡는다).
 * 그래서 여기서 클라이언트로 내려와 useSearchParams로 읽는다.
 */
export default function NewBrewDialog() {
  const isOpen = useSearchParams().get("form") === "brew";
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  const close = () => router.replace(pathname as Route);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();

    // iOS 사파리는 <dialog>가 열려 있어도 뒤 화면이 스크롤되고 당겨서 새로고침도 걸린다.
    // 명세상으론 모달이 막아줘야 하지만 지키지 않아서, 열려 있는 동안 직접 잠근다.
    //   overflow-hidden   스크롤 자체를 막는다
    //   overscroll-none   끝에 닿았을 때의 튐 · 당겨서 새로고침을 막는다
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
      className="m-auto h-4/5 w-[calc(100%-4rem)] max-w-344 overflow-y-auto overscroll-contain rounded-2xl bg-background backdrop:bg-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      // ESC를 막지 않으면 브라우저가 DOM만 닫아 주소에 ?form=brew 가 남는다.
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      ref={ref}
    >
      {isOpen && (
        <div className="flex min-h-full flex-col">
          <header className="flex justify-end p-4">
            <button
              aria-label="닫기"
              className="rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-primary-tint"
              onClick={close}
              type="button"
            >
              ✕
            </button>
          </header>

          <NewBrewForm />

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
              form={BREW_FORM_ID}
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
