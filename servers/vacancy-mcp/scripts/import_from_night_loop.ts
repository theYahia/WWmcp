#!/usr/bin/env node
// Импорт raw.json от night-loop vacancies-scan в SQLite-базу vacancy-mcp.
//
// Использование:
//   npm run import -- [--src D:/Yahia/active/night-loop/output] [--days 7]
//
// По умолчанию читает все output/<date>/vacancies-scan/raw.json за последние 7 дней.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, upsertVacancy, closeDb, type Vacancy } from "../src/db.js";

interface NightLoopRecord {
  id: string;
  source: string;
  company?: string;
  title: string;
  url: string;
  summary?: string;
  salary?: string;
  location?: string;
  posted_at?: string;
  query?: string;
  src?: string;
}

// Парсинг salary string в (min, max) RUB. Очень defensive — Russian формат
// разный: "350 000 ₽ NET", "от 200к", "150-250 тыс руб", "$5000".
// Возвращает оба null если не распознано.
function parseSalary(s: string | undefined): { min: number | null; max: number | null } {
  if (!s) return { min: null, max: null };
  const cleaned = s.replace(/\s+/g, " ").trim();

  // Игнорим $ / EUR / USD — нужны только RUB.
  if (/[$€]|USD|EUR|GBP/i.test(cleaned)) return { min: null, max: null };

  // "X тыс" / "Xк" / "X k" — умножаем на 1000.
  const toNum = (raw: string): number | null => {
    const numMatch = raw.match(/(\d+(?:[.,]\d+)?)/);
    if (!numMatch) return null;
    let n = parseFloat(numMatch[1].replace(",", "."));
    if (/тыс|к\b|\bk\b/i.test(raw)) n *= 1000;
    if (/млн|m\b/i.test(raw)) n *= 1_000_000;
    return Math.round(n);
  };

  // Range: "150-250 тыс", "150 000 - 250 000".
  const rangeMatch = cleaned.match(/(\d[\d\s]*)\s*[-–—]\s*(\d[\d\s]*(?:\s*(?:тыс|к|млн))?)/i);
  if (rangeMatch) {
    const a = toNum(rangeMatch[1].replace(/\s/g, ""));
    const b = toNum(rangeMatch[2].replace(/\s/g, ""));
    return { min: a, max: b };
  }

  // "от X" / "от X тыс".
  const fromMatch = cleaned.match(/от\s+(\d[\d\s]*(?:\s*(?:тыс|к|млн))?)/i);
  if (fromMatch) {
    return { min: toNum(fromMatch[1].replace(/\s/g, "")), max: null };
  }

  // Просто число "350 000 ₽ NET" — трактуем как exact (min = max).
  const single = cleaned.replace(/\s/g, "").match(/(\d+)(тыс|к|млн)?/i);
  if (single) {
    const n = toNum(cleaned.replace(/\s/g, ""));
    return { min: n, max: n };
  }
  return { min: null, max: null };
}

// Эвристическое присвоение role на основе title.
function classifyRole(title: string): string | null {
  const t = title.toLowerCase();
  if (/продакт|product\s+(?:manager|owner|lead|head)|\bpm\b|\bpo\b/i.test(t)) return "product";
  if (/\bml\b|machine\s+learning|deep\s+learning|llm|genai/i.test(t)) return "ml";
  if (/data\s+(?:scientist|analyst|engineer)|аналит/i.test(t)) return "data";
  if (/frontend|backend|fullstack|разработчик|developer|engineer/i.test(t)) return "engineering";
  if (/designer|дизайнер/i.test(t)) return "design";
  if (/marketing|маркетолог/i.test(t)) return "marketing";
  return null;
}

function* walkRawFiles(srcDir: string, days: number): Generator<string> {
  if (!existsSync(srcDir)) return;
  const cutoff = Date.now() - days * 86400 * 1000;
  for (const dateDir of readdirSync(srcDir)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDir)) continue;
    const fullDate = resolve(srcDir, dateDir);
    if (!statSync(fullDate).isDirectory()) continue;
    const scanDir = resolve(fullDate, "vacancies-scan");
    const raw = resolve(scanDir, "raw.json");
    if (!existsSync(raw)) continue;
    if (statSync(raw).mtimeMs < cutoff) continue;
    yield raw;
  }
}

function parseArgs(): { src: string; days: number } {
  const args = process.argv.slice(2);
  let src = "D:/Yahia/active/night-loop/output";
  let days = 7;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--src" && args[i + 1]) { src = args[++i]; }
    else if (args[i] === "--days" && args[i + 1]) { days = parseInt(args[++i], 10); }
  }
  return { src, days };
}

function main(): void {
  const { src, days } = parseArgs();
  console.log(`[import] reading from ${src}, last ${days} days`);
  const db = getDb();
  const now = new Date().toISOString();
  let total = 0;
  let imported = 0;
  let skipped = 0;

  const tx = db.transaction((records: NightLoopRecord[]) => {
    for (const r of records) {
      total++;
      if (!r.id || !r.url || !r.title) {
        skipped++;
        continue;
      }
      const { min, max } = parseSalary(r.salary);
      const v: Vacancy = {
        id: r.id,
        title: r.title.slice(0, 500),
        company: r.company ?? null,
        salary_min: min,
        salary_max: max,
        salary_raw: r.salary ?? null,
        location: r.location ?? null,
        posted_at: r.posted_at ?? null,
        source: r.source,
        url: r.url,
        role: classifyRole(r.title),
        raw: JSON.stringify(r),
        imported_at: now,
      };
      upsertVacancy(db, v);
      imported++;
    }
  });

  for (const raw of walkRawFiles(src, days)) {
    try {
      const records = JSON.parse(readFileSync(raw, "utf8")) as NightLoopRecord[];
      console.log(`  ${raw}: ${records.length} records`);
      tx(records);
    } catch (err) {
      console.error(`  failed to parse ${raw}:`, err);
    }
  }

  console.log(`[import] done: ${imported}/${total} imported, ${skipped} skipped`);
  closeDb();
}

main();
