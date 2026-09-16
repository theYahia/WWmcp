/**
 * MCP Resources — static reference data loaded into LLM context.
 *
 * These help AI agents understand DaData quality codes and capabilities
 * without needing to make API calls.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResources(server: McpServer): void {
  server.resource(
    "quality-codes",
    "dadata://reference/quality-codes",
    { description: "DaData quality codes (qc, qc_geo) for address and phone validation results" },
    async () => ({
      contents: [
        {
          uri: "dadata://reference/quality-codes",
          mimeType: "text/markdown",
          text: QUALITY_CODES_MD,
        },
      ],
    }),
  );

  server.resource(
    "capabilities",
    "dadata://reference/capabilities",
    { description: "DaData API capabilities — what is free vs paid, limits, and supported data types" },
    async () => ({
      contents: [
        {
          uri: "dadata://reference/capabilities",
          mimeType: "text/markdown",
          text: CAPABILITIES_MD,
        },
      ],
    }),
  );
}

// ---------------------------------------------------------------------------
// Resource content (kept as constants to avoid accidental mutation)
// ---------------------------------------------------------------------------

const QUALITY_CODES_MD = `# DaData Quality Codes

## Address quality (qc)
| Code | Meaning | Action |
|------|---------|--------|
| 0 | Recognized with certainty | Safe to use |
| 1 | Recognized with assumptions | Verify manually |
| 2 | Partially recognized (city only) | Ask user for details |
| 3 | Not recognized | Input is likely invalid |

## Geocoding quality (qc_geo)
| Code | Meaning |
|------|---------|
| 0 | Exact house coordinates |
| 1 | Nearest house |
| 2 | Street level |
| 3 | Settlement level |
| 4 | City level |
| 5 | Coordinates not available |

## Phone quality (qc)
| Code | Meaning |
|------|---------|
| 0 | Valid phone number |
| 1 | Partially valid (needs verification) |
| 2 | Invalid or empty |
| 3 | Multiple numbers detected |
| 7 | Foreign phone number |

## Confidence mapping
- qc=0 → high confidence (safe to use as-is)
- qc=1 → medium confidence (verify with user)
- qc≥2 → low confidence (likely needs correction)
`;

const CAPABILITIES_MD = `# DaData API Capabilities

## Free tier (10,000 requests/day)
- Address autocomplete (Russia: to apartment level, World: to city)
- Company search by name, INN, or OGRN
- Bank search by BIC, SWIFT, or name
- Reverse geocoding (coordinates → address)
- IP geolocation (IPv4 → Russian city)

## Paid (0.20 RUB per record, ~$0.002)
- Address standardization (80+ structured fields, coordinates, quality codes)
- Phone validation (carrier, region, timezone, mobile/landline type)
- Name parsing and standardization (surname/name/patronymic, gender)
- Email validation (type detection, disposable check)

## Rate limits
- 30 requests/second per IP
- 10,000 requests/day (free tier)
- Daily limit resets at midnight Moscow time (00:00 MSK)

## Important notes
- Suggest tools work with DADATA_API_KEY only (free)
- Clean tools require both DADATA_API_KEY and DADATA_SECRET_KEY (paid)
- Company data depth depends on subscription tier (free/standard/premium)
`;
