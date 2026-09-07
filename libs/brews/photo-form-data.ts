import type { BrewForm } from "@/libs/schemas/brew";
import type { NewBrewPhoto } from "@/libs/schemas/brew-photo";

export function toBrewPhotoFormData(
  brewInput: BrewForm,
  photos: NewBrewPhoto[],
): FormData {
  const formData = new FormData();

  formData.set("brew", JSON.stringify(brewInput));
  formData.set(
    "photos",
    JSON.stringify(photos.map(({ clientId }) => ({ kind: "new", clientId }))),
  );

  for (const photo of photos) {
    formData.set(`photo:${photo.clientId}:thumbnail`, photo.thumbnail, "thumbnail.webp");
    formData.set(`photo:${photo.clientId}:large`, photo.large, "large.webp");
  }

  return formData;
}
