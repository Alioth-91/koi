import Link from "next/link";

import BeanList from "@/components/beans/bean-list";
import BeanPanes from "@/components/beans/bean-panes";
import { listBeans } from "@/libs/db/beans";

export default async function BeansLayout({ children }: LayoutProps<"/beans">) {
  const beans = await listBeans();

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex w-full items-center justify-between border-b border-border-foreground px-4 py-2">
        <div>
          <div className="font-archivo text-xs text-muted-foreground">
            /BEANS · 보유 {beans.length}봉
          </div>

          <h1 className="text-2xl font-bold">원두</h1>
        </div>

        <Link
          href="?form=bean"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          원두 등록
        </Link>
      </header>

      <BeanPanes list={<BeanList beans={beans} />} detail={children} />
    </main>
  );
}
