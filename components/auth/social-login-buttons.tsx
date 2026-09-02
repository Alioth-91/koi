"use client";

import { useState } from "react";

import SocialLoginIcon, {
  type SocialProvider,
} from "@/components/auth/social-login-icon";
import { getCanonicalOrigin } from "@/libs/auth/origin";
import { createClient } from "@/libs/db/client";

const providers = [
  { provider: "kakao", label: "카카오 로그인" },
  { provider: "google", label: "Google 계정으로 로그인" },
] as const satisfies ReadonlyArray<{
  provider: SocialProvider;
  label: string;
}>;

const baseButtonClassName =
  "flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-4 text-sm font-medium leading-5 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60";

const buttonClassNames: Record<SocialProvider, string> = {
  kakao: "bg-[#FEE500] text-black/85 hover:shadow-sm",
  google: "border border-[#747775] bg-white text-[#1F1F1F] hover:bg-[#f8f9fa]",
};

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
        getCanonicalOrigin(),
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
          className={`${baseButtonClassName} ${buttonClassNames[provider]}`}
          disabled={pendingProvider !== null}
          key={provider}
          onClick={() => void handleSignIn(provider)}
          type="button"
        >
          <SocialLoginIcon provider={provider} />
          <span>
            {pendingProvider === provider ? "로그인으로 이동 중..." : label}
          </span>
        </button>
      ))}

      <p aria-live="polite" className="min-h-5 text-sm text-destructive">
        {message}
      </p>
    </div>
  );
}
