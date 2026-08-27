import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * YY년 MM월 DD일 → "26년 08월 25일"
 */
export function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${year.slice(2)}년 ${month}월 ${day}일`;
}

/**
 * 오늘 날짜 → "YYYY-MM-DD"
 *
 * 지역 시간으로 뽑고 padStart로 자릿수를 고정한다 (스키마 YYYY-MM-DD 요구)
 */
export function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth는 0부터
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}
