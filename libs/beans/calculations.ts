const MILLISECONDS_PER_DAY = 86_400_000;

/** 볶은 날짜부터 기준 날짜까지 지난 일수. 날짜를 계산할 수 없으면 undefined. */
export function daysSinceRoast(
  roastedAt: string | undefined,
  referenceDate = new Date(),
): number | undefined {
  if (!roastedAt || Number.isNaN(referenceDate.getTime())) return undefined;

  const [year, month, day] = roastedAt.split("-").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return undefined;
  }

  const roastedDate = new Date(year, month - 1, day);
  const isValidDate =
    roastedDate.getFullYear() === year &&
    roastedDate.getMonth() === month - 1 &&
    roastedDate.getDate() === day;

  if (!isValidDate) return undefined;

  const referenceDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  return Math.round(
    (referenceDay.getTime() - roastedDate.getTime()) / MILLISECONDS_PER_DAY,
  );
}

/** 구매 용량에서 누적 사용량을 뺀 잔량. 음수는 0으로 멈춘다. */
export function remainingWeight(
  weight: number | undefined,
  usedWeight: number,
): number | undefined {
  if (!Number.isFinite(weight) || !Number.isFinite(usedWeight)) {
    return undefined;
  }

  return Math.max(0, weight! - usedWeight);
}

/** 구매 가격을 구매 용량으로 나눈 g당 가격. */
export function pricePerGram(
  price: number | undefined,
  weight: number | undefined,
): number | undefined {
  if (!Number.isFinite(price) || !Number.isFinite(weight) || weight! <= 0) {
    return undefined;
  }

  return price! / weight!;
}

/** g당 가격에 사용량을 곱한 한 잔 원가. */
export function cupCost(
  price: number | undefined,
  weight: number | undefined,
  dose: number | undefined,
): number | undefined {
  if (!Number.isFinite(dose) || dose! <= 0) return undefined;

  const perGram = pricePerGram(price, weight);
  return perGram === undefined ? undefined : perGram * dose!;
}
