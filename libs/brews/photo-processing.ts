export function isSupportedBrewPhoto(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

export async function processBrewPhoto(
  file: File,
): Promise<{ thumbnail: Blob; large: Blob }> {
  if (!isSupportedBrewPhoto(file)) {
    throw new Error("JPEG·PNG·WebP 사진만 사용할 수 있습니다");
  }

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const encode = async (maxSize: number, quality: number): Promise<Blob> => {
      const { width, height } = getBrewPhotoSize(
        bitmap.width,
        bitmap.height,
        maxSize,
      );

      const canvas = new OffscreenCanvas(
        Math.max(1, width),
        Math.max(1, height),
      );

      const context = canvas.getContext("2d");

      if (!context) throw new Error("사진을 그릴 수 없습니다");

      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await canvas.convertToBlob({ type: "image/webp", quality });

      if (blob.type !== "image/webp") {
        throw new Error("이 브라우저에서는 WebP 변환을 지원하지 않습니다");
      }

      return blob;
    };

    const thumbnail = await encode(400, 0.75);
    const large = await encode(2000, 0.8);

    return { thumbnail, large };
  } finally {
    bitmap.close();
  }
}

export function getBrewPhotoSize(
  width: number,
  height: number,
  maxSize: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxSize / Math.max(width, height));

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
