"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Props = {
  cafeName: string;
  location: { lat: number; lng: number };
};

/**
 * 기록 상세에서 보여주는, 만질 수 없는 카페 위치 지도.
 *
 * 서버에서는 그릴 수 없다 — window.kakao 와 실제 DOM 노드가 있어야
 * SDK가 지도를 붙인다. 그래서 여기가 클라이언트 경계다.
 */
export default function CafeStaticMap({ cafeName, location }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const kakao = window.kakao;
    const box = boxRef.current;

    if (!ready || !kakao || !box) return;

    const position = new kakao.maps.LatLng(location.lat, location.lng);

    new kakao.maps.StaticMap(box, {
      center: position,
      level: 4,
      marker: { position },
    });

    return () => {
      box.innerHTML = ""; // 다시 그릴 때 지도가 겹쳐 쌓이지 않게 비운다
    };
  }, [location.lat, location.lng, ready]);

  return (
    <>
      <Script
        onReady={() => window.kakao?.maps.load(() => setReady(true))}
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
      />

      <div
        aria-label={`${cafeName} 위치`}
        className="aspect-3/1 w-full overflow-hidden rounded-2xl bg-primary-tint"
        ref={boxRef}
        role="img"
      />
    </>
  );
}
