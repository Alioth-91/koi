import * as z from "zod";

import {
  optionalDate,
  optionalNumber,
  optionalText,
} from "@/libs/schemas/fields";
import type { Bean } from "@/types/bean";

/**
 * 원두 등록 폼 스키마
 *
 * 필수는 이름 하나. `archived` 는 없다 — 등록 시점엔 항상 안 쓴 봉지다.
 */
export const beanSchema = z.object({
  name: z.string().min(1, "원두 이름을 입력해주세요"),
  roastery: optionalText,
  roastedAt: optionalDate,
  process: optionalText,
  roastLevel: optionalText,
  weight: optionalNumber,
  price: optionalNumber,
});

export type BeanForm = z.infer<typeof beanSchema>;

/** 스키마가 뽑은 타입이 types/bean과 어긋나면 빌드를 깨뜨린다 */
type Assert<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 검사 자체가 목적이라 쓰이지 않는다
type _BeanFormMatchesBean = Assert<
  BeanForm & { id: string } extends Bean ? true : false
>;
