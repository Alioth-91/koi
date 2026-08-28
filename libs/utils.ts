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

/**
 * 0.5 단위라 소수 한 자리로 고정한다. 정수 점수도 "4"가 아니라 "4.0"으로
 * 나와야 목록에서 자릿수가 흔들리지 않는다.
 */
export function formatScore(score: number) {
  return score.toFixed(1);
}
