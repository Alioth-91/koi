import Image from "next/image";
import Link from "next/link";

function PreviewPanel({ detail = false }: { detail?: boolean }) {
  return (
    <div className="rounded-2xl border border-border-foreground/60 bg-background p-4">
      <div className="h-3 w-20 rounded-full bg-primary-tint" />

      {detail ? (
        <div className="mt-5 space-y-3">
          <div className="h-6 w-3/4 rounded-lg bg-primary-tint" />
          <div className="bg-muted h-3 w-full rounded-full" />
          <div className="bg-muted h-3 w-5/6 rounded-full" />
          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="h-16 rounded-xl bg-primary-tint" />
            <div className="h-16 rounded-xl bg-primary-tint" />
            <div className="h-16 rounded-xl bg-primary-tint" />
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="h-14 rounded-xl bg-primary-tint" />
          <div className="bg-muted h-14 rounded-xl" />
          <div className="bg-muted h-14 rounded-xl" />
          <div className="h-14 rounded-xl bg-primary-tint" />
        </div>
      )}
    </div>
  );
}

export default function GuestPreview() {
  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 gap-3 p-4 opacity-65 blur-[3px]"
      >
        <PreviewPanel />
        <PreviewPanel detail />
      </div>

      <div className="relative z-10 flex min-h-full items-center justify-center bg-background/65 p-6">
        <section
          aria-label="로그인 필요"
          className="w-full max-w-sm rounded-3xl border border-border-foreground bg-background/95 p-6 text-center shadow-card"
        >
          <Image
            alt="koi 로고"
            className="mx-auto mb-4 size-18"
            height={72}
            loading="eager"
            src="/icon.svg"
            width={72}
          />

          <h2 className="mt-4 text-lg font-extrabold">
            로그인하고 나만의 커피 기록을 시작해보세요
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            기록을 저장하고 원두와 레시피를 관리할 수 있어요.
          </p>

          <Link
            className="mt-5 block rounded-xl bg-primary px-4 py-3 font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
            href="/login"
          >
            로그인하기
          </Link>
        </section>
      </div>
    </div>
  );
}
