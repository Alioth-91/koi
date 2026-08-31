import SocialLoginButtons from "@/components/auth/social-login-buttons";

export default function AuthPanel() {
  return (
    <div className="rounded-3xl border border-border-foreground p-6 shadow-card">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-extrabold">소셜 계정으로 계속하기</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          카카오 또는 Google 계정으로 로그인하세요
        </p>
      </div>

      <SocialLoginButtons />
    </div>
  );
}
