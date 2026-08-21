"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Routes } from "@/libs/constants/routes";
import { cn } from "@/libs/utils";

export default function BottomTab() {
  const pathName = usePathname();

  return (
    <div className="border-t border-t-border-foreground md:hidden">
      <ul className="flex flex-1 py-4">
        {Routes.map((item) => (
          <li
            className={cn(
              "w-full rounded-xl text-center text-[11px] font-semibold text-subtle-foreground",
              pathName === item.link && "font-extrabold",
            )}
            key={item.link}
          >
            <Link href={item.link}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
