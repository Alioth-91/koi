export interface Route {
  name: string;
  link: string;
}

export const Routes: Route[] = [
  { name: "대시보드", link: "/" },
  { name: "기록", link: "/record" },
  { name: "원두", link: "/bean" },
  { name: "레시피", link: "/recipe" },
  { name: "설정", link: "/setting" },
];
