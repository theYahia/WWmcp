// SQLite слой. Схема создаётся idempotent при первом подключении.
// БД read-mostly: writes только из import-скрипта, MCP-tools работают на read.

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export interface Vacancy {
  id: string;
  title: string;
  company: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_raw: string | null;
  location: string | null;
  posted_at: string | null;
  source: string;
  url: string;
  role: string | null;       // нормализованная роль (PM/ML/Data/...)
  raw: string;               // оригинальный JSON record (для debug + rich detail)
  imported_at: string;       // ISO timestamp когда заимпортирован
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS vacancies (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  company      TEXT,
  salary_min   INTEGER,
  salary_max   INTEGER,
  salary_raw   TEXT,
  location     TEXT,
  posted_at    TEXT,
  source       TEXT NOT NULL,
  url          TEXT NOT NULL,
  role         TEXT,
  raw          TEXT NOT NULL,
  imported_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_company  ON vacancies(company);
CREATE INDEX IF NOT EXISTS idx_source   ON vacancies(source);
CREATE INDEX IF NOT EXISTS idx_posted   ON vacancies(posted_at);
CREATE INDEX IF NOT EXISTS idx_role     ON vacancies(role);
CREATE INDEX IF NOT EXISTS idx_imported ON vacancies(imported_at);

-- FTS5 для full-text search по title + company + salary_raw + raw.
CREATE VIRTUAL TABLE IF NOT EXISTS vacancies_fts USING fts5(
  id UNINDEXED,
  title,
  company,
  salary_raw,
  raw,
  content='vacancies',
  content_rowid='rowid'
);

-- Триггеры для синхронизации FTS с базовой таблицей.
CREATE TRIGGER IF NOT EXISTS vacancies_ai AFTER INSERT ON vacancies BEGIN
  INSERT INTO vacancies_fts(rowid, id, title, company, salary_raw, raw)
  VALUES (new.rowid, new.id, new.title, new.company, new.salary_raw, new.raw);
END;
CREATE TRIGGER IF NOT EXISTS vacancies_ad AFTER DELETE ON vacancies BEGIN
  INSERT INTO vacancies_fts(vacancies_fts, rowid, id, title, company, salary_raw, raw)
  VALUES ('delete', old.rowid, old.id, old.title, old.company, old.salary_raw, old.raw);
END;
CREATE TRIGGER IF NOT EXISTS vacancies_au AFTER UPDATE ON vacancies BEGIN
  INSERT INTO vacancies_fts(vacancies_fts, rowid, id, title, company, salary_raw, raw)
  VALUES ('delete', old.rowid, old.id, old.title, old.company, old.salary_raw, old.raw);
  INSERT INTO vacancies_fts(rowid, id, title, company, salary_raw, raw)
  VALUES (new.rowid, new.id, new.title, new.company, new.salary_raw, new.raw);
END;
`;

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = resolve(process.env.VACANCY_DB_PATH || "./data/vacancies.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  _db = db;
  return db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/** Идемпотентный upsert. Использовать в import-скрипте. */
export function upsertVacancy(db: Database.Database, v: Vacancy): void {
  const stmt = db.prepare(`
    INSERT INTO vacancies (
      id, title, company, salary_min, salary_max, salary_raw,
      location, posted_at, source, url, role, raw, imported_at
    ) VALUES (
      @id, @title, @company, @salary_min, @salary_max, @salary_raw,
      @location, @posted_at, @source, @url, @role, @raw, @imported_at
    )
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      company=excluded.company,
      salary_min=excluded.salary_min,
      salary_max=excluded.salary_max,
      salary_raw=excluded.salary_raw,
      location=excluded.location,
      posted_at=excluded.posted_at,
      source=excluded.source,
      url=excluded.url,
      role=excluded.role,
      raw=excluded.raw,
      imported_at=excluded.imported_at
  `);
  stmt.run(v);
}
