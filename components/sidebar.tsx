"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveNav, navItems } from "@/libs/constants/routes";
import { SITE } from "@/libs/constants/site";
import { cn } from "@/libs/utils";

export type SidebarProfile = {
  displayName: string;
  avatarUrl: string | null;
};

type SidebarProps = {
  profile: SidebarProfile | null;
};

export default function Sidebar({ profile }: SidebarProps) {
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
          .filter(
            (item) =>
              !item.disabled && (item.href !== "/settings" || profile !== null),
          )
          .map((item) => {
            const isActive = isActiveNav(pathName, item.href);

            return (
              <li key={item.href}>
                {/* 여백·배경을 <a>에 둔다 — <li>에 두면 글자만 눌린다. */}
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block w-full rounded-xl font-semibold text-foreground transition hover:bg-primary-tint md:py-2.5 md:text-center xl:px-4 xl:py-3 xl:text-left",
                    isActive &&
                      "bg-foreground text-primary-foreground hover:bg-primary-hover",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

        <li className="md:mt-5">
          <Link
            className="block w-full rounded-xl bg-primary py-3.5 text-center font-extrabold text-primary-foreground transition hover:bg-primary-hover"
            href={profile ? "?form=brew" : "/login"}
          >
            기록 추가
          </Link>
        </li>
      </ul>

      {profile ? (
        <Link
          aria-label="프로필 설정"
          className="flex items-center justify-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-primary-tint xl:justify-start xl:px-4"
          href="/settings"
        >
          {profile.avatarUrl ? (
            // OAuth provider URL은 제공처마다 달라 next/image의 고정 허용 목록을 두지 않는다.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-8 shrink-0 rounded-full object-cover"
              height={36}
              loading="lazy"
              referrerPolicy="no-referrer"
              src={profile.avatarUrl}
              width={36}
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-extrabold text-foreground">
              {profile.displayName.slice(0, 1)}
            </span>
          )}

          <span className="hidden min-w-0 truncate font-semibold text-foreground xl:block">
            {profile.displayName}
          </span>
        </Link>
      ) : (
        <Link
          aria-label="로그인"
          className="flex items-center justify-center gap-3 rounded-xl p-2 text-left font-semibold text-subtle-foreground transition-colors hover:bg-primary-tint xl:justify-start xl:px-4"
          href="/login"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm">
            →
          </span>
          <span className="hidden xl:block">로그인</span>
        </Link>
      )}
    </nav>
  );
}
