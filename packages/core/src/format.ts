/**
 * Response formatting utilities.
 *
 * Key insight: CSV is 29% more token-efficient than JSON for tabular data.
 * For 1000 rows, this saves ~13,800 tokens.
 */

/**
 * Formats an array of items for MCP tool responses.
 * Uses CSV for concise lists (3+ items), JSON for detailed or small results.
 * Adds truncation info and cursor hint when results exceed maxItems.
 */
export function formatResponse(
  items: unknown[],
  opts: {
    maxItems?: number;
    format?: "concise" | "detailed";
    cursorField?: string;
  } = {},
): string {
  const { maxItems = 25, format = "concise", cursorField } = opts;
  const total = items.length;
  const page = items.slice(0, maxItems);

  let header = "";
  if (total > maxItems) {
    const cursorHint = cursorField
      ? ` Используйте ${cursorField} последнего элемента как cursor для следующей страницы.`
      : " Используйте offset/page для следующей страницы.";
    header = `Показано ${maxItems} из ${total}.${cursorHint}\n`;
  }

  if (page.length === 0) {
    return "Результатов не найдено.";
  }

  if (
    format === "concise" &&
    page.length > 3 &&
    typeof page[0] === "object" &&
    page[0] !== null
  ) {
    return header + toCSV(page as Record<string, unknown>[]);
  }

  return (
    header + JSON.stringify(page, null, format === "detailed" ? 2 : 0)
  );
}

function toCSV(items: Record<string, unknown>[]): string {
  const keys = Object.keys(items[0]!);
  const header = keys.join(",");
  const rows = items.map((item) =>
    keys
      .map((k) => {
        const val = item[k];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(","),
  );
  return [header, ...rows].join("\n");
}

/** Format kopecks to rubles with ₽ symbol (Russian locale) */
export function formatRUB(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(kopecks / 100);
}

/** Format tiyins to sum with locale (Uzbek) */
export function formatUZS(tiyins: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(tiyins / 100);
}

/** Format tenge (Kazakh) */
export function formatKZT(tiyin: number): string {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
  }).format(tiyin / 100);
}

/** Format ISO date to Russian long format */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(
    new Date(iso),
  );
}

/** Format number with locale-aware separators */
export function formatNumber(
  value: number,
  locale = "ru-RU",
  decimals = 2,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
