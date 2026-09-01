import type { Bean } from "@/types/bean";
import type { Database } from "@/types/supabase";

type BeanRow = Database["public"]["Tables"]["beans"]["Row"];
type BeanInsert = Database["public"]["Tables"]["beans"]["Insert"];
type BeanInput = Pick<
  Bean,
  | "name"
  | "roastery"
  | "roastedAt"
  | "weight"
  | "price"
  | "process"
  | "roastLevel"
>;

export function toBean(row: BeanRow): Bean {
  return {
    archived: row.archived,
    id: row.id,
    name: row.name,
    price: row.price ?? undefined,
    process: row.process ?? undefined,
    roastLevel: row.roast_level ?? undefined,
    roastedAt: row.roasted_at ?? undefined,
    roastery: row.roastery ?? undefined,
    weight: row.weight ?? undefined,
  };
}

export function toBeanInsert(input: BeanInput, userId: string): BeanInsert {
  return {
    name: input.name,
    price: input.price ?? null,
    process: input.process ?? null,
    roast_level: input.roastLevel ?? null,
    roasted_at: input.roastedAt ?? null,
    roastery: input.roastery ?? null,
    user_id: userId,
    weight: input.weight ?? null,
  };
}
