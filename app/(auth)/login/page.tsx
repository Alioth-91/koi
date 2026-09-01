import type { Metadata } from "next";
import Image from "next/image";

import AuthPanel from "@/components/auth/auth-panel";
import { SITE } from "@/libs/constants/site";

export const metadata: Metadata = {
  title: `로그인 · ${SITE.title}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <section className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <Image
            alt="koi 로고"
            className="mx-auto mb-4 size-18"
            height={72}
            loading="eager"
            src="/favicon.svg"
            width={72}
          />
          <h1 className="font-archivo text-4xl font-extrabold">{SITE.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            커피 기록을 한곳에서 관리하세요
          </p>
        </header>

        <AuthPanel />
      </section>
    </main>
  );
}
