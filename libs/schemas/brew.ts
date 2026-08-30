import * as z from "zod";

import { optionalNumber, optionalText } from "@/libs/schemas/fields";
import type { Brew } from "@/types/brew";

/**
 * 안 고른 축은 0이다. 라디오 미선택은 null, ✕ 칸은 "0", 등록 전에는 undefined로 온다.
 * `v == null` 은 null과 undefined를 한 번에 받는다(`===` 두 번을 대신한다).
 */
const sensoryScore = z
  .union([
    z.literal(""),
    z.null(),
    z.undefined(),
    z.coerce.number().pipe(z.literal([0, 1, 2, 3, 4, 5])),
  ])
  .transform((v) => (v === "" || v == null ? 0 : v));

/**
 * 기록 공통 폼 스키마
 */
const baseSchema = z.object({
  date: z.iso.date(),
  score: z.number().min(0).max(5).multipleOf(0.5),
  memo: optionalText,
  // 선택이 아니다. 라디오가 항상 등록되어 있어 sensory 키는 늘 존재하고,
  // 안 고른 축은 null로 와서 위 transform이 0으로 바꾼다.
  sensory: z.object({
    acidity: sensoryScore,
    body: sensoryScore,
    bitterness: sensoryScore,
    sweetness: sensoryScore,
    aftertaste: sensoryScore,
  }),
});

export const homeSchema = baseSchema.extend({
  type: z.literal("home"),
  beanName: z.string().min(1, "원두 이름을 입력해주세요"),
  dose: optionalNumber,
  method: optionalText,
  time: optionalText,
  water: optionalNumber,
  waterTemp: optionalNumber,
});

export const cafeSchema = baseSchema.extend({
  type: z.literal("cafe"),
  cafeName: z.string().min(1, "카페 이름을 입력해주세요"),
  menu: optionalText,
  price: optionalNumber,

  temperature: z
    .union([z.literal(""), z.enum(["hot", "iced"])])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  address: optionalText,
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const brewSchema = z.discriminatedUnion("type", [
  homeSchema,
  cafeSchema,
]);

// 이제 BrewForm도 유니온이다 — types/brew.ts 의 Brew와 같은 모양.
export type BrewForm = z.infer<typeof brewSchema>;

/**
 * 스키마가 뽑은 타입이 types/brew와 어긋나면 빌드를 깨뜨린다.
 */
type Assert<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 검사 자체가 목적이라 쓰이지 않는다
type _BrewFormMatchesBrew = Assert<
  BrewForm & { id: string } extends Brew ? true : false
>;
