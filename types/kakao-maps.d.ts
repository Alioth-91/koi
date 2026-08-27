/**
 * 카카오 지도 SDK는 <script>로 들어와 전역 window.kakao 에 붙는다.
 * 타입이 없으면 통째로 any가 되므로, 지금 쓰는 것만 선언한다.
 *
 * export {} 때문에 이 파일은 모듈이다. 그래서 타입도 declare global 안에 둬야
 * 다른 파일에서 보인다 — 바깥에 두면 이 파일 안에서만 쓰인다.
 */
declare global {
  type KakaoLatLng = {
    getLat: () => number;
    getLng: () => number;
  };

  type KakaoMap = {
    setCenter: (position: KakaoLatLng) => void;
  };

  type KakaoMarker = {
    setMap: (map: KakaoMap | null) => void;
    setPosition: (position: KakaoLatLng) => void;
  };

  /** keywordSearch가 돌려주는 장소 하나. x가 경도, y가 위도이고 둘 다 문자열이다. */
  type KakaoPlace = {
    address_name: string;
    id: string;
    place_name: string;
    road_address_name: string;
    x: string;
    y: string;
  };

  interface Window {
    kakao?: {
      maps: {
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (
          element: HTMLElement,
          options: { center: KakaoLatLng; level: number },
        ) => KakaoMap;
        Marker: new (options: {
          map: KakaoMap;
          position: KakaoLatLng;
        }) => KakaoMarker;
        // autoload=false 로 받았을 때 SDK를 실제로 켜는 함수.
        load: (callback: () => void) => void;
        // libraries=services 로 함께 받아온 것. 서버 없이 브라우저에서 장소를 찾는다.
        services: {
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (places: KakaoPlace[], status: string) => void,
            ) => void;
          };
          Status: { ERROR: string; OK: string; ZERO_RESULT: string };
        };
      };
    };
  }
}

export {};
