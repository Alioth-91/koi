"use client";

/* eslint-disable @next/next/no-img-element -- 브라우저 Blob URL은 Next 이미지 최적화 대상이 아니다. */

import { useEffect, useState, type ChangeEvent } from "react";

import { processBrewPhotoFiles } from "@/libs/brews/photo-processing";
import type { NewBrewPhoto } from "@/libs/schemas/brew-photo";

type Props = {
  disabled?: boolean;
  onPhotosChange: (photos: NewBrewPhoto[]) => void;
};
type Preview = { clientId: string; url: string };

export default function BrewPhotoField({ disabled, onPhotosChange }: Props) {
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => {
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    setError("");
    void processBrewPhotoFiles(files)
      .then((photos) => {
        setPreviews(
          photos.map(({ clientId, thumbnail }) => ({
            clientId,
            url: URL.createObjectURL(thumbnail),
          })),
        );
        onPhotosChange(photos);
      })
      .catch((error) =>
        setError(
          error instanceof Error ? error.message : "사진을 처리하지 못했습니다",
        ),
      );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] text-muted-foreground">사진 (최대 3장)</span>
      <label className="flex aspect-[3/1] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border-foreground text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <span aria-hidden className="text-2xl leading-none">+</span>
        <span className="mt-2 text-xs">사진 선택</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          multiple
          type="file"
          onChange={handleChange}
        />
      </label>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <img
              key={preview.clientId}
              alt="선택한 기록 사진 미리보기"
              className="aspect-square w-full rounded-xl object-cover"
              src={preview.url}
            />
          ))}
        </div>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
