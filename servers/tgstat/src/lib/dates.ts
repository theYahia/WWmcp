/**
 * Date helpers.
 *
 * TGStat date-range parameters (startDate/endDate, startTime/endTime) are Unix
 * timestamps in **seconds**, but humans (and LLMs) think in YYYY-MM-DD. Tools
 * accept the friendly form and convert here.
 */

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convert a "YYYY-MM-DD" date (or any ISO string) to Unix **seconds**.
 * `endOfDay` snaps a bare date to 23:59:59 UTC instead of 00:00:00 — useful for
 * an inclusive end of a range. Returns undefined for undefined input.
 * Throws on an unparseable string (callers validate format via Zod first).
 */
export function toUnix(date: string | undefined, endOfDay = false): number | undefined {
  if (date === undefined || date === "") return undefined;
  const iso = YMD.test(date) ? `${date}T${endOfDay ? "23:59:59" : "00:00:00"}Z` : date;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid date "${date}" — expected format YYYY-MM-DD.`);
  }
  return Math.floor(ms / 1000);
}

/** Convert Unix seconds (number or numeric string) to an ISO string, or undefined. */
export function fromUnix(value: unknown): string | undefined {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return undefined;
  return new Date(n * 1000).toISOString();
}
