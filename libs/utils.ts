import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * YYYY-MM-DD → "26년 08월 25일"
 *
 * Date를 거치지 않는다 — 시간대 때문에 하루가 밀릴 수 있다.
 */
export function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${year.slice(2)}년 ${month}월 ${day}일`;
}
