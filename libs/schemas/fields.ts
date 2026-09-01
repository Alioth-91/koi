import * as z from "zod";

/**
 * 폼 공통 필드 스키마
 */

/** 빈 칸이면 `undefined` */
export const optionalNumber = z
  .union([z.literal(""), z.coerce.number().min(0)])
  .transform((value) => (value === "" ? undefined : value))
  .optional();

/** 빈 칸이면 `undefined` */
export const optionalText = z
  .string()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const optionalDate = z
  .union([z.literal(""), z.iso.date()])
  .transform((value) => (value === "" ? undefined : value))
  .optional();
