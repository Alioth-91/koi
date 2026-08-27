"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// 고른 자리가 없을 때 보여줄 기본 위치
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

type Props = {
  location: { lat: number; lng: number } | undefined;
};

/**
 * 카페 위치 지도
 */
export default function CafeMap({ location }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const kakao = window.kakao;
    const box = boxRef.current;

    if (!ready || !kakao || !box) return;

    mapRef.current = new kakao.maps.Map(box, {
      // 항상 기본 자리에서 시작한다. 고른 자리가 있으면 아래 effect가 곧바로 옮긴다 —
      // 여기서 location을 보면 값이 바뀔 때마다 지도를 새로 만들게 된다.
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 4,
    });

    return () => {
      mapRef.current = null;
      markerRef.current = null;
      box.innerHTML = ""; // 지도 정보를 초기화시키기 위한 작업
    };
  }, [ready]);

  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;

    if (!kakao || !map || !location) return;

    const position = new kakao.maps.LatLng(location.lat, location.lng);

    map.setCenter(position);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new kakao.maps.Marker({ map, position });
    }
  }, [location, ready]);

  return (
    <>
      <Script
        onReady={() => window.kakao?.maps.load(() => setReady(true))}
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
      />

      <div
        className="h-64 w-full overflow-hidden rounded-2xl bg-primary-tint"
        ref={boxRef}
      />
    </>
  );
}
