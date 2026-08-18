/** Shared input validation for CDEK tools (runs before any API call). */

export interface LocationInput {
  code?: number;
  postal_code?: string;
  address?: string;
}

/**
 * CDEK identifies each location by city code or postal code. Validate up front so
 * the user gets an actionable message instead of an opaque CDEK API error.
 * Thrown errors are surfaced as MCP tool errors via `withErrorHandling`.
 */
export function assertLocationTarget(loc: LocationInput, label: string): void {
  if (loc.code === undefined && !loc.postal_code) {
    throw new Error(
      `${label}: укажите code (код города СДЭК) или postal_code (почтовый индекс). ` +
        "Код города можно найти через get_cities.",
    );
  }
}
