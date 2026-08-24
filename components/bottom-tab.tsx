"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/libs/constants/routes";
import { cn } from "@/libs/utils";

export default function BottomTab() {
  const pathName = usePathname();

  return (
    <nav
      aria-label="주 메뉴"
      className="border-t border-t-border-foreground md:hidden"
    >
      <ul className="flex flex-1 py-4">
        {navItems
          .filter((item) => !item.disabled)
          .map((item) => (
            <li
              className={cn(
                "w-full rounded-xl text-center text-[11px] font-semibold text-subtle-foreground",
                pathName === item.href &&
                  "font-extrabold underline underline-offset-2",
              )}
              key={item.href}
            >
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
