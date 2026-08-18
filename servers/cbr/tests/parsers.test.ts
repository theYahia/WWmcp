import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  parseDateParts,
  shiftDays,
  isoFromDate,
  isoToArchivePath,
  isoToCbrDate,
  ddmmyyyyToIso,
  parseRu,
  parseKeyRateHtml,
  keyRateChanges,
  keyRateSince,
  parseMetalsXml,
  latestMetals,
  parseDynamicsXml,
  normalizeDailyJson,
  parseOfficialDailyXml,
} from "../dist/parsers.js";

const fx = (name: string) => new URL(`./fixtures/${name}`, import.meta.url);

const keyRateHtml = readFileSync(fx("keyrate.html"), "utf-8");
const metalsXml = readFileSync(fx("metals.xml"), "utf-8");
const dynamicsXml = readFileSync(fx("dynamics.xml"), "utf-8");
const dailyJson = JSON.parse(readFileSync(fx("daily.json"), "utf-8"));
// Официальный XML — реально windows-1251 (русские названия валют).
const officialXml = new TextDecoder("windows-1251").decode(readFileSync(fx("official_daily.win1251.xml")));

describe("даты (UTC, без таймзона-багов)", () => {
  it("парсит валидную дату", () => {
    expect(parseDateParts("2025-01-09")).toMatchObject({ yyyy: 2025, mm: 1, dd: 9, iso: "2025-01-09" });
  });
  it("отвергает неверный формат", () => {
    expect(() => parseDateParts("2025/01/09")).toThrow();
    expect(() => parseDateParts("09-01-2025")).toThrow();
    expect(() => parseDateParts("garbage")).toThrow();
  });
  it("отвергает несуществующую дату", () => {
    expect(() => parseDateParts("2025-02-30")).toThrow();
    expect(() => parseDateParts("2025-13-01")).toThrow();
  });
  it("shiftDays пересекает месяц/год одинаково в любой таймзоне", () => {
    expect(shiftDays("2025-01-01", -1)).toBe("2024-12-31");
    expect(shiftDays("2025-03-01", -1)).toBe("2025-02-28");
    expect(shiftDays("2024-03-01", -1)).toBe("2024-02-29"); // високосный
    expect(shiftDays("2025-01-01", -4)).toBe("2024-12-28");
  });
  it("isoFromDate использует UTC", () => {
    expect(isoFromDate(new Date(Date.UTC(2025, 0, 1)))).toBe("2025-01-01");
  });
  it("форматы дат ЦБ", () => {
    expect(isoToArchivePath("2025-03-08")).toBe("2025/03/08");
    expect(isoToCbrDate("2025-03-08", "/")).toBe("08/03/2025");
    expect(isoToCbrDate("2025-03-08", ".")).toBe("08.03.2025");
    expect(ddmmyyyyToIso("23.06.2026")).toBe("2026-06-23");
  });
  it("parseRu разбирает русский числовой формат", () => {
    expect(parseRu("14,25")).toBe(14.25);
    expect(parseRu("9750,59")).toBe(9750.59);
    expect(parseRu("1 234,56")).toBeCloseTo(1234.56, 2);
  });
});

describe("ключевая ставка (hd_base HTML)", () => {
  const points = parseKeyRateHtml(keyRateHtml);

  it("извлекает пары дата+ставка", () => {
    expect(points.length).toBeGreaterThan(300);
  });
  it("отсортированы по убыванию даты (новые первыми)", () => {
    expect(points[0].date >= points[1].date).toBe(true);
    expect(points[0].date).toBe("2026-06-23");
  });
  it("текущая ставка корректна", () => {
    expect(points[0].rate).toBe(14.25);
  });
  it("since = начало непрерывной серии текущей ставки", () => {
    expect(keyRateSince(points)).toBe("2026-06-22");
  });
  it("changes свёрнуты в точки изменения, новые первыми", () => {
    const ch = keyRateChanges(points);
    expect(ch.length).toBeLessThan(points.length);
    expect(ch.length).toBeGreaterThan(1);
    expect(ch[0]).toEqual({ date: "2026-06-22", rate: 14.25 });
    expect(ch[ch.length - 1].rate).toBe(21);
    // соседние точки изменения не должны совпадать по ставке
    for (let i = 1; i < ch.length; i++) expect(ch[i].rate).not.toBe(ch[i - 1].rate);
  });
});

describe("драгметаллы (windows-1251 XML)", () => {
  const recs = parseMetalsXml(metalsXml);

  it("парсит записи", () => {
    expect(recs.length).toBeGreaterThan(0);
  });
  it("содержит buy, sell и название", () => {
    const gold = recs.find((r) => r.code === "1");
    expect(gold?.name).toBe("Золото");
    expect(gold?.buy).toBeGreaterThan(0);
    expect(gold?.sell).toBeGreaterThan(0);
    expect(gold?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("latestMetals сводит к 4 металлам по возрастанию кода", () => {
    const latest = latestMetals(recs);
    expect(latest.map((m) => m.code)).toEqual(["1", "2", "3", "4"]);
  });
});

describe("динамика курса (XML_dynamic)", () => {
  const pts = parseDynamicsXml(dynamicsXml);

  it("парсит ряд", () => {
    expect(pts.length).toBeGreaterThan(0);
  });
  it("точки содержат дату/значение/курс", () => {
    expect(pts[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pts[0].value).toBeGreaterThan(0);
    expect(pts[0].rate).toBeGreaterThan(0);
  });
});

describe("курсы зеркала (JSON)", () => {
  it("нормализует валидный ответ", () => {
    const d = normalizeDailyJson(dailyJson);
    expect(d.Valute.USD).toBeTruthy();
    expect(d.Valute.USD.Value).toBeGreaterThan(0);
  });
  it("отвергает ответ без Valute", () => {
    expect(() => normalizeDailyJson({ foo: 1 })).toThrow();
    expect(() => normalizeDailyJson(null)).toThrow();
  });
});

describe("официальный XML_daily (windows-1251 fallback)", () => {
  const d = parseOfficialDailyXml(officialXml);

  it("парсит валюты", () => {
    expect(d.Valute.USD).toBeTruthy();
    expect(d.Valute.USD.Value).toBeGreaterThan(0);
  });
  it("декодирует русские названия из 1251", () => {
    expect(d.Valute.USD.Name).toMatch(/[А-Яа-я]/);
  });
  it("Previous = Value (официальный XML не содержит предыдущего)", () => {
    expect(d.Valute.USD.Previous).toBe(d.Valute.USD.Value);
  });
});
