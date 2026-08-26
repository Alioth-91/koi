import { Route } from "next";

export type NavItem<T extends string = string> = {
  label: string;
  disabled?: boolean;
  href: T;
};

export const navItems: NavItem<Route>[] = [
  { label: "대시보드", href: "/" },
  { label: "기록", href: "/brews" },
  { label: "원두", href: "/beans" },
  { label: "레시피", href: "/recipes" },
  { label: "커뮤니티", disabled: true, href: "/community" },
  { label: "설정", href: "/settings" },
];

/**
 * 네비게이션 항목이 활성인지 — "이 페이지인가"가 아닌 "이 섹션 안인가"를 묻는다.
 *
 * 대시보드("/")는 모든 경로의 접두사라 예외로 뺀다.
 */
export function isActiveNav(pathName: string, href: string) {
  if (href === "/") return pathName === "/";

  return pathName === href || pathName.startsWith(`${href}/`);
}
