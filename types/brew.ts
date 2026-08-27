type SensoryScore = 1 | 2 | 3 | 4 | 5;

type Sensory = {
  acidity?: SensoryScore; // 산미
  body?: SensoryScore; // 바디감
  bitterness?: SensoryScore; // 쓴맛
  sweetness?: SensoryScore; // 단맛
  aftertaste?: SensoryScore; // 여운
};

type BrewBase = {
  date: string; // YYYY-MM-DD, 문자열 정렬만으로 날짜순이 됨
  id: string;
  score: number; // 0.5 단위
  sensory?: Sensory; // 미입력 축은 넣지 않는다
  memo?: string;
};

export type HomeBrew = BrewBase & {
  beanName: string;
  dose?: number;
  method?: string; // 추출 방식(ex. 에스프레소, 핸드드립, 프렌치프레스 등)
  time?: string;
  type: "home";
  water?: number;
  waterTemp?: number; // 물 온도(℃). 카페의 temperature(hot/iced)와는 다른 값
};

export type CafeBrew = BrewBase & {
  address?: string;
  cafeName: string;
  menu?: string;
  location?: { lat: number; lng: number };
  price?: number;
  temperature?: "hot" | "iced";
  type: "cafe";
};

export type Brew = HomeBrew | CafeBrew;
