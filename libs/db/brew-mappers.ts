import type { Database } from "@/types/supabase";
import type { Brew, CafeBrew, HomeBrew } from "@/types/brew";

type BrewRow = Database["public"]["Tables"]["brews"]["Row"];
type SensoryScore = Brew["sensory"][keyof Brew["sensory"]];

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
