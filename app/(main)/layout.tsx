import { Suspense } from "react";

import Sidebar from "@/components/sidebar";
import BottomTab from "@/components/bottom-tab";
import FormDialog from "@/components/form-dialog";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="flex min-h-0 flex-1 justify-center bg-background font-sans">
        <div className="flex min-h-0 w-full max-w-344">
          <Sidebar />

          {children}
        </div>
      </div>

      <BottomTab />

      {/* Suspense가 없으면 useSearchParams 때문에 정적 페이지가 전부 클라이언트 렌더로 떨어진다. */}
      <Suspense>
        <FormDialog />
      </Suspense>
    </>
  );
}
