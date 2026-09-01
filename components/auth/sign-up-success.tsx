"use client";

type Props = {
  email: string;
  onBackToLogin: () => void;
};

export default function SignUpSuccess({ email, onBackToLogin }: Props) {
  return (
    <section aria-live="polite" className="text-center" role="status">
      <div
        aria-hidden="true"
        className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-tint text-2xl"
      >
        ✓
      </div>

      <h2 className="mt-4 text-xl font-extrabold">확인 메일을 보냈습니다</h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        <strong className="break-all text-foreground">{email}</strong>
        <br />
        메일함에서 확인 링크를 열어 가입을 완료해주세요.
      </p>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        메일이 보이지 않으면 스팸함도 확인해주세요.
      </p>

      <button
        className="mt-6 w-full cursor-pointer rounded-xl border border-border-foreground py-3.5 font-bold text-foreground transition hover:bg-primary-tint"
        onClick={onBackToLogin}
        type="button"
      >
        로그인으로 돌아가기
      </button>
    </section>
  );
}
