import { Suspense } from "react";
import type { User } from "@supabase/supabase-js";

import Sidebar, { type SidebarProfile } from "@/components/sidebar";
import BottomTab from "@/components/bottom-tab";
import FormDialog from "@/components/form-dialog";
import { createClient } from "@/libs/db/server";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toSidebarProfile(user: User | null): SidebarProfile | null {
  if (!user) return null;

  const metadata = user.user_metadata;
  const emailPrefix = user.email?.split("@", 1)[0];
  const displayName =
    readText(metadata.nickname) ??
    readText(metadata.name) ??
    readText(metadata.full_name) ??
    readText(emailPrefix) ??
    "사용자";
  const avatarUrl =
    readText(metadata.picture) ??
    readText(metadata.avatar_url) ??
    readText(metadata.profile_image_url);

  return { displayName, avatarUrl };
}

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = user !== null;

  return (
    <>
      <div className="flex min-h-0 flex-1 justify-center bg-background font-sans">
        <div className="flex min-h-0 w-full max-w-344">
          <Sidebar profile={toSidebarProfile(user)} />

          {children}
        </div>
      </div>

      <BottomTab isAuthenticated={isAuthenticated} />

      {/* 비로그인 사용자는 ?form=brew/bean으로 등록 폼을 직접 열 수 없어야 한다. */}
      {isAuthenticated && (
        <Suspense>
          <FormDialog />
        </Suspense>
      )}
    </>
  );
}
