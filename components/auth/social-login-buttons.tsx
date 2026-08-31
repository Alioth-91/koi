"use client";

import { useState } from "react";

import { createClient } from "@/libs/db/client";

type SocialProvider = "kakao" | "google";

const providers = [
  { provider: "kakao", label: "카카오로 시작하기" },
  { provider: "google", label: "Google로 시작하기" },
] as const satisfies ReadonlyArray<{
  provider: SocialProvider;
  label: string;
}>;

const errorMessage = "로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요";

export default function SocialLoginButtons() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const handleSignIn = async (provider: SocialProvider) => {
    setPendingProvider(provider);
    setMessage("");

    try {
      const supabase = createClient();
      const redirectTo = new URL(
        "/auth/callback",
        window.location.origin,
      ).toString();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        setPendingProvider(null);
        setMessage(errorMessage);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setPendingProvider(null);
      setMessage(errorMessage);
    }
  };

  return (
    <div className="space-y-3">
      {providers.map(({ provider, label }) => (
        <button
          className="w-full cursor-pointer rounded-xl border border-border-foreground px-4 py-3.5 font-bold transition-colors hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
          disabled={pendingProvider !== null}
          key={provider}
          onClick={() => void handleSignIn(provider)}
          type="button"
        >
          {pendingProvider === provider ? "로그인으로 이동 중..." : label}
        </button>
      ))}

      <p aria-live="polite" className="min-h-5 text-sm text-destructive">
        {message}
      </p>
    </div>
  );
}
