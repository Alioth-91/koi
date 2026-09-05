import * as z from "zod";

import { brewSchema, type BrewForm } from "@/libs/schemas/brew";

const newPhotoEntrySchema = z.object({
  clientId: z.uuid(),
  kind: z.literal("new"),
});

const existingPhotoEntrySchema = z.object({
  kind: z.literal("existing"),
  largePath: z.string().min(1),
  thumbnailPath: z.string().min(1),
});

const photoEntrySchema = z.discriminatedUnion("kind", [
  newPhotoEntrySchema,
  existingPhotoEntrySchema,
]);

const photosSchema = z
  .array(photoEntrySchema)
  .max(3)
  .superRefine((photos, context) => {
    const newPhotoIds = photos
      .filter((photo) => photo.kind === "new")
      .map((photo) => photo.clientId);

    if (new Set(newPhotoIds).size !== newPhotoIds.length) {
      context.addIssue({
        code: "custom",
        message: "새 기록 사진 식별자가 중복되었습니다",
      });
    }
  });

export type NewBrewPhoto = {
  clientId: string;
  large: Blob;
  thumbnail: Blob;
};

export type ParsedBrewPhotoFormData = {
  brewInput: BrewForm;
  newPhotos: NewBrewPhoto[];
  photos: z.infer<typeof photoEntrySchema>[];
};

export function parseBrewPhotoFormData(
  formData: FormData,
): ParsedBrewPhotoFormData {
  const brewInput = brewSchema.parse(parseJsonField(formData, "brew"));
  const photos = photosSchema.parse(parseJsonField(formData, "photos", []));

  const newPhotos = photos.flatMap((photo) => {
    if (photo.kind === "existing") return [];

    return [
      {
        clientId: photo.clientId,
        large: getWebpFile(formData, `photo:${photo.clientId}:large`),
        thumbnail: getWebpFile(formData, `photo:${photo.clientId}:thumbnail`),
      },
    ];
  });

  return { brewInput, newPhotos, photos };
}

function parseJsonField(
  formData: FormData,
  name: string,
  fallback?: unknown,
): unknown {
  const value = formData.get(name);

  if (value === null) {
    if (fallback !== undefined) return fallback;

    throw new Error(`${name} 필드가 없습니다`);
  }

  if (typeof value !== "string") {
    throw new Error(`${name} 필드가 올바르지 않습니다`);
  }

  return JSON.parse(value);
}

function getWebpFile(formData: FormData, name: string): Blob {
  const value = formData.get(name);

  if (
    !(value instanceof Blob) ||
    value.size === 0 ||
    value.type !== "image/webp"
  ) {
    throw new Error("기록 사진은 WebP 파일 두 개가 필요합니다");
  }

  return value;
}
