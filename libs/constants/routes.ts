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
