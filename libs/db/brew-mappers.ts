import type { BrewForm } from "@/libs/schemas/brew";
import type { Database } from "@/types/supabase";
import type { Brew, CafeBrew, HomeBrew } from "@/types/brew";

type BrewRow = Database["public"]["Tables"]["brews"]["Row"];
type BrewInsert = Database["public"]["Tables"]["brews"]["Insert"];
type BrewUpdate = Database["public"]["Tables"]["brews"]["Update"];
type SensoryScore = Brew["sensory"][keyof Brew["sensory"]];

export type ResolvedBrewForm =
  | (Extract<BrewForm, { type: "home" }> & {
      beanName: string;
      beanPrice?: number;
      beanWeight?: number;
    })
  | Extract<BrewForm, { type: "cafe" }>;

/**
 * DB row의 snake_case 필드와 저장 형식을 화면용 Brew로 바꾼다.
 */
export function toBrew(row: BrewRow): Brew {
  const common = {
    date: row.date,
    id: row.id,
    memo: row.memo ?? undefined,
    score: row.score,
    sensory: {
      acidity: toSensoryScore(row.acidity),
      aftertaste: toSensoryScore(row.aftertaste),
      bitterness: toSensoryScore(row.bitterness),
      body: toSensoryScore(row.body),
      sweetness: toSensoryScore(row.sweetness),
    },
  };

  if (row.type === "home") {
    if (row.bean_name === null) {
      throw new Error("유효하지 않은 집 기록입니다");
    }

    return {
      ...common,
      beanId: row.bean_id ?? undefined,
      beanName: row.bean_name,
      beanPrice: row.bean_price ?? undefined,
      beanWeight: row.bean_weight ?? undefined,
      dose: row.dose ?? undefined,
      method: row.method ?? undefined,
      time: toTime(row.duration_seconds),
      type: "home",
      water: row.water ?? undefined,
      waterTemp: row.water_temp ?? undefined,
    } satisfies HomeBrew;
  }

  if (row.type === "cafe") {
    if (row.cafe_name === null) {
      throw new Error("유효하지 않은 카페 기록입니다");
    }

    return {
      ...common,
      address: row.address ?? undefined,
      cafeName: row.cafe_name,
      location:
        row.lat !== null && row.lng !== null
          ? { lat: row.lat, lng: row.lng }
          : undefined,
      menu: row.menu ?? undefined,
      price: row.price ?? undefined,
      temperature: toTemperature(row.temperature),
      type: "cafe",
    } satisfies CafeBrew;
  }

  throw new Error("지원하지 않는 기록 유형입니다");
}

/**
 * 서버에서 원두 연결을 확인한 폼 값을 DB insert row로 바꾼다.
 * beanName은 브라우저 입력이 아니라 서버가 원두 row에서 읽은 스냅샷이다.
 */
export function toBrewInsert(
  input: ResolvedBrewForm,
  userId: string,
): BrewInsert {
  return {
    ...toBrewValues(input),
    user_id: userId,
  };
}

/**
 * 기존 기록을 수정할 DB row로 바꾼다. id·user_id·created_at은 수정하지 않는다.
 */
export function toBrewUpdate(input: ResolvedBrewForm): BrewUpdate {
  return toBrewValues(input);
}

function toBrewValues(input: ResolvedBrewForm): Omit<BrewInsert, "user_id"> {
  const common = {
    acidity: input.sensory.acidity,
    aftertaste: input.sensory.aftertaste,
    bitterness: input.sensory.bitterness,
    body: input.sensory.body,
    date: input.date,
    memo: input.memo ?? null,
    score: input.score,
    sweetness: input.sensory.sweetness,
    type: input.type,
  };

  if (input.type === "home") {
    return {
      ...common,
      address: null,
      bean_id: input.beanId,
      bean_name: input.beanName,
      bean_price: input.beanPrice ?? null,
      bean_weight: input.beanWeight ?? null,
      cafe_name: null,
      dose: input.dose ?? null,
      duration_seconds: toDurationSeconds(input.time),
      lat: null,
      lng: null,
      menu: null,
      method: input.method ?? null,
      price: null,
      temperature: null,
      water: input.water ?? null,
      water_temp: input.waterTemp ?? null,
    };
  }

  return {
    ...common,
    address: input.address ?? null,
    bean_id: null,
    bean_name: null,
    bean_price: null,
    bean_weight: null,
    cafe_name: input.cafeName,
    dose: null,
    duration_seconds: null,
    lat: input.location?.lat ?? null,
    lng: input.location?.lng ?? null,
    menu: input.menu ?? null,
    method: null,
    price: input.price ?? null,
    temperature: input.temperature ?? null,
    water: null,
    water_temp: null,
  };
}

function toSensoryScore(value: number): SensoryScore {
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    throw new Error("유효하지 않은 감각 점수입니다");
  }

  return value as SensoryScore;
}

function toTemperature(value: string | null): CafeBrew["temperature"] {
  if (value === null) return undefined;
  if (value === "hot" || value === "iced") return value;

  throw new Error("유효하지 않은 온도입니다");
}

function toTime(seconds: number | null): string | undefined {
  if (seconds === null) return undefined;
  if (!Number.isInteger(seconds) || seconds < 0) {
    throw new Error("유효하지 않은 추출 시간입니다");
  }

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function toDurationSeconds(time: string | undefined): number | null {
  if (time === undefined) return null;

  const [minutes, seconds] = time.split(":").map(Number);
  if (
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new Error("유효하지 않은 추출 시간입니다");
  }

  return minutes * 60 + seconds;
}
