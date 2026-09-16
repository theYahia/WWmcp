/** Формат даты Voximplant Platform API: "YYYY-MM-DD HH:mm:ss" (UTC). */
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function isValidDateTime(s: string): boolean {
  if (!DATETIME_RE.test(s)) return false;
  return !Number.isNaN(Date.parse(s.replace(" ", "T") + "Z"));
}

/** Date → "YYYY-MM-DD HH:mm:ss" (UTC). */
export function formatDateTime(d: Date): string {
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

/** Диапазон [сейчас − N часов, сейчас] в формате API. */
export function lastHoursRange(hours: number, now: Date = new Date()): { from: string; to: string } {
  const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return { from: formatDateTime(from), to: formatDateTime(now) };
}
