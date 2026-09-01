"use client";

import { useEffect, useRef, useState } from "react";

export type PickedCafe = {
  address: string;
  location: { lat: number; lng: number };
  name: string;
};

type Props = {
  onSelect: (cafe: PickedCafe) => void;
};

/**
 * 카페 검색
 */
export default function CafeSearch({ onSelect }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    if (!places.length) return;

    const closeOnOutside = (event: PointerEvent) => {
      if (boxRef.current?.contains(event.target as Node)) return;

      setPlaces([]);
    };

    document.addEventListener("pointerdown", closeOnOutside);

    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [places.length]);

  const search = () => {
    const kakao = window.kakao;

    if (!kakao || !keyword.trim()) return;

    new kakao.maps.services.Places().keywordSearch(keyword, (found, status) => {
      setPlaces(status === kakao.maps.services.Status.OK ? found : []);
    });
  };

  const selectedCafe = (place: KakaoPlace) => {
    onSelect({
      address: place.road_address_name || place.address_name,
      location: { lat: Number(place.y), lng: Number(place.x) },
      name: place.place_name,
    });
    setPlaces([]);
    setKeyword(place.place_name);
  };

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-border-foreground px-3 py-2 text-base outline-none placeholder:text-placeholder"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;

            e.preventDefault();
            search();
          }}
          placeholder="카페 이름"
          value={keyword}
        />

        <button
          className="shrink-0 cursor-pointer rounded-xl border border-border-foreground px-3 text-sm font-bold transition-colors hover:bg-primary-tint"
          onClick={search}
          type="button"
        >
          검색
        </button>
      </div>

      {places.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-10 mt-2 max-h-40 overflow-y-auto rounded-xl border border-border-foreground bg-background shadow-sheet">
          {places.map((place) => (
            <li key={place.id}>
              <button
                className="w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-primary-tint"
                onClick={() => selectedCafe(place)}
                type="button"
              >
                <span className="block text-sm font-bold">
                  {place.place_name}
                </span>

                <span className="block text-xs text-muted-foreground">
                  {place.road_address_name || place.address_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
