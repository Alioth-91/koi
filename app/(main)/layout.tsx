import Sidebar from "@/components/sidebar";
import BottomTab from "@/components/bottom-tab";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="flex flex-1 justify-center bg-background font-sans">
        <div className="flex w-full max-w-344">
          <Sidebar />

          {children}
        </div>
      </div>

      <BottomTab />
    </>
  );
}
