import type { Brew } from "@/types/brew";

export type BrewFilters = {
  beanId?: string;
  method?: string;
  type?: Brew["type"];
};

export const BREW_FILTER_QUERY_KEYS = {
  beanId: "bean",
  method: "method",
  type: "type",
} as const;

type SearchParamsLike = Pick<URLSearchParams, "get">;

export function parseBrewFilters(searchParams: SearchParamsLike): BrewFilters {
  const type = searchParams.get(BREW_FILTER_QUERY_KEYS.type);

  return {
    beanId: readValue(searchParams.get(BREW_FILTER_QUERY_KEYS.beanId)),
    method: readValue(searchParams.get(BREW_FILTER_QUERY_KEYS.method)),
    type: type === "home" || type === "cafe" ? type : undefined,
  };
}

export function toBrewFilterSearchParams(
  filters: BrewFilters,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filters.beanId) {
    searchParams.set(BREW_FILTER_QUERY_KEYS.beanId, filters.beanId);
  }

  if (filters.method) {
    searchParams.set(BREW_FILTER_QUERY_KEYS.method, filters.method);
  }

  if (filters.type) {
    searchParams.set(BREW_FILTER_QUERY_KEYS.type, filters.type);
  }

  return searchParams;
}

export function filterBrews(brews: Brew[], filters: BrewFilters): Brew[] {
  return brews.filter((brew) => {
    if (filters.type && brew.type !== filters.type) return false;

    if (
      filters.beanId &&
      (brew.type !== "home" || brew.beanId !== filters.beanId)
    ) {
      return false;
    }

    if (
      filters.method &&
      (brew.type !== "home" || brew.method !== filters.method)
    ) {
      return false;
    }

    return true;
  });
}

export function listBrewMethods(brews: Brew[]): string[] {
  return [
    ...new Set(
      brews.flatMap((brew) =>
        brew.type === "home" && brew.method ? [brew.method] : [],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function countBrewFilters(filters: BrewFilters): number {
  return Object.values(filters).filter(Boolean).length;
}

function readValue(value: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}
