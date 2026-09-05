import "server-only";

import { createClient } from "@/libs/db/server";
import type { BrewPhoto, BrewPhotoView } from "@/types/brew";

const BREW_PHOTOS_BUCKET = "brew-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

type UploadBrewPhotoPairInput = {
  userId: string;
  brewId: string;
  thumbnail: Blob;
  large: Blob;
};

export async function uploadBrewPhotoPair(
  input: UploadBrewPhotoPairInput,
): Promise<BrewPhoto> {
  const supabase = await createClient();
  const bucket = supabase.storage.from(BREW_PHOTOS_BUCKET);
  const basePath = `${input.userId}/brews/${input.brewId}/${crypto.randomUUID()}`;
  const thumbnailPath = `${basePath}/thumbnail.webp`;
  const largePath = `${basePath}/large.webp`;
  const uploadedPaths: string[] = [];

  try {
    const thumbnailResult = await bucket.upload(
      thumbnailPath,
      input.thumbnail,
      {
        contentType: "image/webp",
        upsert: false,
      },
    );

    if (thumbnailResult.error) {
      throw new Error("기록 사진 업로드에 실패했습니다", {
        cause: thumbnailResult.error,
      });
    }
    uploadedPaths.push(thumbnailPath);

    const largeResult = await bucket.upload(largePath, input.large, {
      contentType: "image/webp",
      upsert: false,
    });

    if (largeResult.error) {
      throw new Error("기록 사진 업로드에 실패했습니다", {
        cause: largeResult.error,
      });
    }
    uploadedPaths.push(largePath);
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const cleanupResult = await bucket.remove(uploadedPaths);

      if (cleanupResult.error) {
        console.error("기록 사진 임시 파일 정리에 실패했습니다", {
          error: cleanupResult.error,
          paths: uploadedPaths,
        });
      }
    }

    throw error;
  }

  return { largePath, thumbnailPath };
}

export async function removeBrewPhotoPair(photo: BrewPhoto): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(BREW_PHOTOS_BUCKET)
    .remove([photo.thumbnailPath, photo.largePath]);

  if (error) {
    throw new Error("기록 사진 삭제에 실패했습니다", { cause: error });
  }
}

export async function signBrewPhotoUrls(
  photos: BrewPhoto[],
): Promise<BrewPhotoView[]> {
  if (photos.length === 0) return [];

  const supabase = await createClient();
  const bucket = supabase.storage.from(BREW_PHOTOS_BUCKET);

  return Promise.all(
    photos.map(async (photo) => {
      const [thumbnailResult, largeResult] = await Promise.all([
        bucket.createSignedUrl(
          photo.thumbnailPath,
          SIGNED_URL_EXPIRES_IN_SECONDS,
        ),
        bucket.createSignedUrl(photo.largePath, SIGNED_URL_EXPIRES_IN_SECONDS),
      ]);
      if (thumbnailResult.error) {
        throw new Error("기록 사진 URL 생성에 실패했습니다", {
          cause: thumbnailResult.error,
        });
      }

      if (largeResult.error) {
        throw new Error("기록 사진 URL 생성에 실패했습니다", {
          cause: largeResult.error,
        });
      }

      return {
        ...photo,
        largeUrl: largeResult.data.signedUrl,
        thumbnailUrl: thumbnailResult.data.signedUrl,
      };
    }),
  );
}
