/**
 * Парсеры ключевой ставки и динамики курса — офлайн, на зафиксированных
 * фрагментах реальных ответов ЦБ (сеть в тестах не используется).
 */

import { describe, it, expect } from "vitest";
import {
  parseKeyRateHtml,
  keyRateChanges,
  keyRateSince,
  parseDynamicsXml,
  isoToCbrDate,
  parseRu,
  ddmmyyyyToIso,
} from "../src/parsers.js";

/** Фрагмент cbr.ru/hd_base/KeyRate — период со сменой ставки 14,25 → 14,00. */
const KEY_RATE_HTML = `
    <table class="data">
      <tr>
        <th>Дата</th>
        <th>Ставка</th>
      </tr>
      <tr>
        <td>29.07.2026</td>
        <td>14,00</td>
      </tr>
      <tr>
        <td>28.07.2026</td>
        <td>14,00</td>
      </tr>
      <tr>
        <td>27.07.2026</td>
        <td>14,00</td>
      </tr>
      <tr>
        <td>24.07.2026</td>
        <td>14,25</td>
      </tr>
      <tr>
        <td>23.07.2026</td>
        <td>14,25</td>
      </tr>
      <tr>
        <td>22.07.2026</td>
        <td>16,50</td>
      </tr>
    </table>`;

/** Ответ /Error/404, который отдавал мёртвый XML_KeyRate.asp. */
const ERROR_PAGE_HTML = `<html><head><title>404</title></head><body>Страница не найдена</body></html>`;

const DYNAMICS_XML = `<?xml version="1.0" encoding="windows-1251"?><ValCurs ID="R01235" DateRange1="01.08.2026" DateRange2="05.08.2026" name="Foreign Currency Market Dynamic"><Record Date="01.08.2026" Id="R01235"><Nominal>1</Nominal><Value>79,4637</Value><VunitRate>79,4637</VunitRate></Record><Record Date="04.08.2026" Id="R01235"><Nominal>1</Nominal><Value>80,0687</Value><VunitRate>80,0687</VunitRate></Record><Record Date="05.08.2026" Id="R01235"><Nominal>1</Nominal><Value>81,1291</Value><VunitRate>81,1291</VunitRate></Record></ValCurs>`;

describe("ключевая ставка (HTML hd_base/KeyRate)", () => {
  const points = parseKeyRateHtml(KEY_RATE_HTML);

  it("извлекает пары дата+ставка", () => {
    expect(points).toHaveLength(6);
  });

  it("сортирует по убыванию даты — текущая ставка первой", () => {
    expect(points[0]).toEqual({ date: "2026-07-29", rate: 14 });
  });

  it("определяет дату вступления текущей ставки в силу", () => {
    expect(keyRateSince(points)).toBe("2026-07-27");
  });

  it("сворачивает дневной ряд в точки изменения, новые первыми", () => {
    expect(keyRateChanges(points)).toEqual([
      { date: "2026-07-27", rate: 14 },
      { date: "2026-07-23", rate: 14.25 },
      { date: "2026-07-22", rate: 16.5 },
    ]);
  });

  it("на странице ошибки ЦБ возвращает пустой ряд, а не мусор", () => {
    expect(parseKeyRateHtml(ERROR_PAGE_HTML)).toEqual([]);
    expect(() => keyRateSince([])).toThrow();
  });
});

describe("динамика курса (XML_dynamic)", () => {
  const pts = parseDynamicsXml(DYNAMICS_XML);

  it("разбирает ряд", () => {
    expect(pts).toHaveLength(3);
    expect(pts[0]).toEqual({
      date: "2026-08-01",
      nominal: 1,
      value: 79.4637,
      rate: 79.4637,
    });
  });
});

describe("вспомогательные разборы", () => {
  it("русский числовой формат", () => {
    expect(parseRu("14,25")).toBe(14.25);
    expect(parseRu("9 750,59")).toBeCloseTo(9750.59, 2);
  });

  it("даты ЦБ", () => {
    expect(ddmmyyyyToIso("23.06.2026")).toBe("2026-06-23");
    expect(isoToCbrDate("2026-03-08", "/")).toBe("08/03/2026");
    expect(isoToCbrDate("2026-03-08", ".")).toBe("08.03.2026");
  });

  it("отвергает мусорную дату вместо подстановки NaN в URL", () => {
    expect(() => isoToCbrDate("08.03.2026")).toThrow(/YYYY-MM-DD/);
    expect(() => isoToCbrDate("2026-02-30")).toThrow(/Несуществующая/);
  });
});
