// today_digest — что нового за последние N часов.
import { z } from "zod";
import { getDb } from "../db.js";

export const todayDigestSchema = z.object({
  hours: z.number().int().min(1).max(168).default(24).describe("Окно в часах (default 24)"),
  source: z
    .enum(["habr-career", "tg-digest", "career-page", "telegram-jobs", "any"])
    .default("any"),
  limit: z.number().int().min(1).max(200).default(50),
});

export async function handleTodayDigest(
  params: z.infer<typeof todayDigestSchema>,
): Promise<string> {
  const db = getDb();
  const cutoff = new Date(Date.now() - params.hours * 3600 * 1000).toISOString();
  const where: string[] = ["imported_at >= @cutoff"];
  const args: Record<string, unknown> = { cutoff, limit: params.limit };
  if (params.source !== "any") {
    where.push("source = @source");
    args.source = params.source;
  }
  const sql = `
    SELECT id, title, company, salary_raw, location, posted_at, source, url
    FROM vacancies
    WHERE ${where.join(" AND ")}
    ORDER BY imported_at DESC, posted_at DESC NULLS LAST
    LIMIT @limit
  `;
  const rows = db.prepare(sql).all(args);

  // Aggregate stats для удобства.
  const breakdown = db
    .prepare(
      `SELECT source, COUNT(*) AS cnt FROM vacancies WHERE imported_at >= @cutoff GROUP BY source ORDER BY cnt DESC`,
    )
    .all({ cutoff });

  return JSON.stringify(
    {
      window_hours: params.hours,
      cutoff,
      total: rows.length,
      breakdown,
      vacancies: rows,
    },
    null,
    2,
  );
}
