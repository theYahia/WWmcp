/**
 * MCP response formatters and quality code labels.
 *
 * Rules:
 *   - success() wraps data as JSON text content
 *   - error() returns { isError: true } so the LLM can see it and retry
 *   - NEVER throw from a tool handler — always return error()
 *   - NEVER use console.log — stdout is JSON-RPC; use console.error for logs
 */

// ---------------------------------------------------------------------------
// MCP response helpers
// ---------------------------------------------------------------------------

export function success(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function error(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

// ---------------------------------------------------------------------------
// Quality code labels — human-readable for AI agents
// ---------------------------------------------------------------------------

export const QC_ADDRESS: Record<number, string> = {
  0: "Address recognized with certainty",
  1: "Address recognized with assumptions — verify manually",
  2: "Address partially recognized (city/region level only)",
  3: "Address not recognized — input may be invalid",
};

export const QC_GEO: Record<number, string> = {
  0: "Exact coordinates (house level)",
  1: "Nearest house coordinates",
  2: "Street-level coordinates",
  3: "Settlement-level coordinates",
  4: "City-level coordinates",
  5: "Coordinates not available",
};

export const QC_PHONE: Record<number, string> = {
  0: "Valid phone number",
  1: "Partially valid — needs manual verification",
  2: "Invalid or empty phone number",
  3: "Multiple phone numbers detected in input",
  7: "Foreign phone number",
};

export const COMPANY_STATUS: Record<string, string> = {
  ACTIVE: "Active (operating normally)",
  LIQUIDATING: "In liquidation process",
  LIQUIDATED: "Liquidated (no longer exists)",
  BANKRUPT: "In bankruptcy proceedings",
  REORGANIZING: "Undergoing reorganization",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert DaData epoch timestamp (ms) to ISO date string. */
export function epochToDate(ts: number | null | undefined): string | null {
  if (ts == null) return null;
  try {
    return new Date(ts).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Map a numeric qc code to a confidence level.
 * Used to give AI agents a quick signal about data quality.
 */
export function qcToConfidence(qc: number): "high" | "medium" | "low" {
  if (qc === 0) return "high";
  if (qc === 1) return "medium";
  return "low";
}
