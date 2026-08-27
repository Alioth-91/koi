import * as z from "zod";

import type { Brew } from "@/types/brew";

const optionalNumber = z
  .union([z.literal(""), z.coerce.number().min(0)])
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const optionalText = z
  .string()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const sensoryScore = z
  .union([
    z.literal(""),
    z.null(),
    z.coerce.number().pipe(z.literal([1, 2, 3, 4, 5])),
  ])
  .transform((v) => (v === "" || v === null ? undefined : v))
  .optional();

/**
 * 기록 공통 폼 스키마
 */
const baseSchema = z.object({
  date: z.iso.date(),
  score: z.number().min(0).max(5).multipleOf(0.5),
  memo: optionalText,
  sensory: z
    .object({
      acidity: sensoryScore,
      body: sensoryScore,
      bitterness: sensoryScore,
      sweetness: sensoryScore,
      aftertaste: sensoryScore,
    })
    .transform((obj) =>
      Object.values(obj).every((v) => v === undefined) ? undefined : obj,
    )
    .optional(),
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

  // 검색해서 고른 자리. 아래 Assert는 이 필드들이 빠져도 못 잡는다 —
  // BrewForm이 Brew에 "들어맞는지"만 보기 때문에 선택 필드 누락은 통과한다.
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
 * 스키마가 뽑은 타입이 Brew와 어긋나면 빌드를 깨뜨린다.
 *
 * 타입 전용이라 컴파일하면 사라진다 — 런타임 비용 0.
 * BrewForm에 id를 붙인 게 곧 Brew여야 한다는 뜻이다.
 */
type Assert<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 검사 자체가 목적이라 쓰이지 않는다
type _BrewFormMatchesBrew = Assert<
  BrewForm & { id: string } extends Brew ? true : false
>;
