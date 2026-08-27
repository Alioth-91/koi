"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveNav, navItems } from "@/libs/constants/routes";
import { cn } from "@/libs/utils";

export default function BottomTab() {
  const pathName = usePathname();

  return (
    <nav
      aria-label="주 메뉴"
      className="border-t border-t-border-foreground md:hidden"
    >
      <ul className="flex flex-1">
        {navItems
          .filter((item) => !item.disabled)
          .map((item) => {
            const isActive = isActiveNav(pathName, item.href);

            return (
              <li className="w-full" key={item.href}>
                {/* 여백을 <a>에 둔다 — ul/li에 두면 11px 글자만 눌린다. */}
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-xl py-4 text-center text-[11px] font-semibold text-subtle-foreground",
                    isActive && "font-extrabold underline underline-offset-2",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
