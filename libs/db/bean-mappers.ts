import type { Bean, BeanPhoto } from "@/types/bean";
import type { Database } from "@/types/supabase";

type BeanRow = Database["public"]["Tables"]["beans"]["Row"];
type BeanInsert = Database["public"]["Tables"]["beans"]["Insert"];
type BeanUpdate = Database["public"]["Tables"]["beans"]["Update"];
type BeanPhotoRow = Pick<
  BeanRow,
  | "photo_1_thumbnail_path"
  | "photo_1_large_path"
  | "photo_2_thumbnail_path"
  | "photo_2_large_path"
  | "photo_3_thumbnail_path"
  | "photo_3_large_path"
>;
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
    photos: toBeanPhotos(row),
    price: row.price ?? undefined,
    process: row.process ?? undefined,
    roastLevel: row.roast_level ?? undefined,
    roastedAt: row.roasted_at ?? undefined,
    roastery: row.roastery ?? undefined,
    weight: row.weight ?? undefined,
  };
}

export function toBeanPhotoColumns(
  photos: BeanPhoto[],
): Pick<
  BeanUpdate,
  | "photo_1_thumbnail_path"
  | "photo_1_large_path"
  | "photo_2_thumbnail_path"
  | "photo_2_large_path"
  | "photo_3_thumbnail_path"
  | "photo_3_large_path"
> {
  if (photos.length > 3) {
    throw new Error("원두 사진은 최대 3장까지 저장할 수 있습니다");
  }

  return {
    photo_1_large_path: photos[0]?.largePath ?? null,
    photo_1_thumbnail_path: photos[0]?.thumbnailPath ?? null,
    photo_2_large_path: photos[1]?.largePath ?? null,
    photo_2_thumbnail_path: photos[1]?.thumbnailPath ?? null,
    photo_3_large_path: photos[2]?.largePath ?? null,
    photo_3_thumbnail_path: photos[2]?.thumbnailPath ?? null,
  };
}

function toBeanPhotos(row: BeanPhotoRow): BeanPhoto[] {
  const slots = [
    {
      largePath: row.photo_1_large_path,
      thumbnailPath: row.photo_1_thumbnail_path,
    },
    {
      largePath: row.photo_2_large_path,
      thumbnailPath: row.photo_2_thumbnail_path,
    },
    {
      largePath: row.photo_3_large_path,
      thumbnailPath: row.photo_3_thumbnail_path,
    },
  ];
  const photos: BeanPhoto[] = [];
  let emptySlotSeen = false;

  for (const slot of slots) {
    const { largePath, thumbnailPath } = slot;

    if (largePath === null && thumbnailPath === null) {
      emptySlotSeen = true;
      continue;
    }

    if (largePath === null || thumbnailPath === null || emptySlotSeen) {
      throw new Error("유효하지 않은 원두 사진입니다");
    }

    photos.push({ largePath, thumbnailPath });
  }

  return photos;
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

export function toBeanUpdate(input: BeanInput): BeanUpdate {
  return {
    name: input.name,
    price: input.price ?? null,
    process: input.process ?? null,
    roast_level: input.roastLevel ?? null,
    roasted_at: input.roastedAt ?? null,
    roastery: input.roastery ?? null,
    weight: input.weight ?? null,
  };
}
