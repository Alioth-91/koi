"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveNav, navItems } from "@/libs/constants/routes";
import { SITE } from "@/libs/constants/site";
import { cn } from "@/libs/utils";

export default function Sidebar() {
  const pathName = usePathname();

  return (
    <nav
      aria-label="주 메뉴"
      className="hidden w-17 flex-col gap-10 p-3 md:flex md:border-r md:border-r-border-foreground md:p-2.5 md:text-[10px] xl:w-60 xl:gap-20 xl:p-4 xl:text-[14px]"
    >
      <Link className="text-3xl font-extrabold" href="/">
        {SITE.name}
      </Link>

      <ul className="flex flex-1 flex-col md:gap-2">
        {navItems
          .filter((item) => !item.disabled)
          .map((item) => {
            const isActive = isActiveNav(pathName, item.href);

            return (
              <li
                className={cn(
                  "w-full rounded-xl font-semibold text-foreground transition hover:bg-primary-tint md:py-2.5 md:text-center xl:px-4 xl:py-3 xl:text-left",
                  isActive &&
                    "bg-foreground text-primary-foreground hover:bg-primary-hover",
                )}
                key={item.href}
              >
                <Link
                  aria-current={isActive ? "page" : undefined}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

        <li className="w-full rounded-xl bg-primary py-3.5 text-center font-extrabold text-primary-foreground transition hover:bg-primary-hover md:mt-5">
          <Link href="/brews/new">기록 추가</Link>
        </li>
      </ul>
    </nav>
  );
}
