/**
 * 가공 방식 배지의 색.
 */
export const PROCESS_BADGE: Record<string, string | undefined> = {
  워시드: "bg-process-washed text-process-washed-foreground",
  내추럴: "bg-process-natural text-process-natural-foreground",
  허니: "bg-process-honey text-process-honey-foreground",
  무산소: "bg-process-anaerobic text-process-anaerobic-foreground",
};

/** 분류되지 않은 가공 방식 */
export const PROCESS_FALLBACK = "bg-primary-tint text-subtle-foreground";

/** 등록 폼의 선택지. 위 객체의 키 순서를 그대로 따른다 */
export const PROCESSES = Object.keys(PROCESS_BADGE);
