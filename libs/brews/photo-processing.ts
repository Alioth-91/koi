export function isSupportedBrewPhoto(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
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
