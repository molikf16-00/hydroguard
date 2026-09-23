/** Missing readings are never measurements of zero. Windows must be complete. */
export function isReading(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
export function completeSum(
  values: Array<number | null>,
  end: number,
  hours: number,
): number | null {
  const start = end - hours + 1;
  if (start < 0 || end >= values.length) return null;
  const window = values.slice(start, end + 1);
  if (window.length !== hours || !window.every(isReading)) return null;
  return (window as number[]).reduce((a, b) => a + b, 0);
}
export function contiguousHours(
  times: string[],
  end: number,
  hours: number,
): boolean {
  if (end < hours - 1) return false;
  for (let i = end - hours + 2; i <= end; i++) {
    if (
      Date.parse(times[i] + ":00Z") - Date.parse(times[i - 1] + ":00Z") !==
      3600000
    )
      return false;
  }
  return true;
}
export function daysBefore(date: string, days: number): string {
  const result = new Date(date + "T00:00:00Z");
  result.setUTCDate(result.getUTCDate() - days);
  return result.toISOString().slice(0, 10);
}
export function cacheAgeMinutes(
  timestamp: string,
  now = Date.now(),
): number | null {
  const age = (now - Date.parse(timestamp)) / 60000;
  return Number.isFinite(age) && age >= 0 && age <= 360 ? age : null;
}
