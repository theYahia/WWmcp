/**
 * Clean tools: clean_address, clean_phone, clean_email, clean_name.
 *
 * All use the Cleaner API (paid, requires Token + Secret).
 * Cost: 0.20 RUB per record.
 *
 * Security: if DADATA_SECRET_KEY is not set, tools return a descriptive
 * error via isError — the server does NOT crash.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callCleaner, getApiKey, getSecretKey } from "../client.js";
import {
  success,
  error,
  QC_ADDRESS,
  QC_GEO,
  QC_PHONE,
  qcToConfidence,
} from "../lib/formatters.js";
import type { CleanAddressResult, CleanPhoneResult, CleanEmailResult, CleanNameResult } from "../types.js";

export function registerCleanTools(server: McpServer): void {
  // --- clean_address ---
  server.tool(
    "clean_address",
    "Standardize a Russian address. Returns structured fields, coordinates, and quality codes. Paid: 0.20 RUB/req.",
    {
      address: z
        .string()
        .min(1)
        .max(500)
        .describe("Address in any format to standardize"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("address", [params.address]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanAddressResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r || !r.result) {
        return success({
          status: "unrecognized",
          message: "Address could not be parsed. Check for typos or try a more complete address.",
          source: params.address,
        });
      }

      return success({
        source: r.source,
        result: r.result,
        postal_code: r.postal_code,
        region: r.region_with_type,
        city: r.city_with_type,
        street: r.street_with_type,
        house: r.house,
        flat: r.flat,
        geo:
          r.geo_lat && r.geo_lon
            ? { lat: r.geo_lat, lon: r.geo_lon }
            : null,
        fias_id: r.fias_id,
        kladr_id: r.kladr_id,
        timezone: r.timezone,
        metro: r.metro ?? null,
        quality: QC_ADDRESS[r.qc] ?? `Unknown quality (qc=${r.qc})`,
        geo_quality: QC_GEO[r.qc_geo] ?? `Unknown geo quality (qc_geo=${r.qc_geo})`,
        confidence: qcToConfidence(r.qc),
        unparsed_parts: r.unparsed_parts ?? null,
      });
    }),
  );

  // --- clean_phone ---
  server.tool(
    "clean_phone",
    "Validate and standardize a phone number. Returns carrier, region, timezone, and type. Paid: 0.20 RUB/req.",
    {
      phone: z
        .string()
        .min(1)
        .max(100)
        .describe("Phone number in any format"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("phone", [params.phone]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanPhoneResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r || !r.phone) {
        return success({
          status: "unrecognized",
          message: "Phone number could not be parsed. Check for typos.",
          source: params.phone,
        });
      }

      return success({
        source: r.source,
        phone: r.phone,
        type: r.type,
        country_code: r.country_code,
        city_code: r.city_code,
        number: r.number,
        extension: r.extension || null,
        carrier: r.provider,
        country: r.country,
        region: r.region,
        city: r.city,
        timezone: r.timezone,
        quality: QC_PHONE[r.qc] ?? `Unknown quality (qc=${r.qc})`,
        is_valid: r.qc === 0,
        confidence: qcToConfidence(r.qc),
      });
    }),
  );

  // --- clean_email ---
  server.tool(
    "clean_email",
    "Validate an email address. Fixes typos, detects disposable/corporate/personal type. Paid: 0.20 RUB/req.",
    {
      email: z
        .string()
        .min(1)
        .max(200)
        .describe("Email address to validate"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("email", [params.email]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanEmailResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r || !r.email) {
        return success({
          status: "unrecognized",
          message: "Email could not be parsed.",
          source: params.email,
        });
      }

      const QC_EMAIL: Record<number, string> = {
        0: "Valid email",
        1: "Invalid email",
        2: "Empty or garbage input",
        3: "Disposable (temporary) email — likely not a real person",
        4: "Email was corrected (typo fixed)",
      };

      return success({
        source: r.source,
        email: r.email,
        local: r.local,
        domain: r.domain,
        type: r.type,
        quality: QC_EMAIL[r.qc] ?? `Unknown (qc=${r.qc})`,
        is_valid: r.qc === 0 || r.qc === 4,
        is_disposable: r.type === "DISPOSABLE",
        is_corporate: r.type === "CORPORATE",
        confidence: qcToConfidence(r.qc === 4 ? 1 : r.qc),
      });
    }),
  );

  // --- clean_name ---
  server.tool(
    "clean_name",
    "Parse and standardize a Russian full name (FIO). Splits into surname/name/patronymic, detects gender. Paid: 0.20 RUB/req.",
    {
      name: z
        .string()
        .min(1)
        .max(300)
        .describe("Full name (FIO) in any format, e.g. 'Иванов Иван Иванович' or 'иван иванов'"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("name", [params.name]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanNameResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r || !r.result) {
        return success({
          status: "unrecognized",
          message: "Name could not be parsed.",
          source: params.name,
        });
      }

      const GENDER_LABELS: Record<string, string> = {
        "М": "Male",
        "Ж": "Female",
        "НД": "Undetermined",
      };

      return success({
        source: r.source,
        result: r.result,
        surname: r.surname,
        name: r.name,
        patronymic: r.patronymic,
        gender: r.gender,
        gender_label: r.gender ? (GENDER_LABELS[r.gender] ?? r.gender) : null,
        cases: {
          genitive: r.result_genitive,
          dative: r.result_dative,
          ablative: r.result_ablative,
        },
        quality: QC_ADDRESS[r.qc] ?? `Unknown (qc=${r.qc})`,
        confidence: qcToConfidence(r.qc),
      });
    }),
  );

  // --- clean_person ---
  server.tool(
    "clean_person",
    "Validate a full person record in one request: FIO + birthdate + address + phone + email + passport. 5-8x cheaper than separate calls. Paid.",
    {
      name: z.string().optional().describe("Full name (FIO), e.g. 'Федотов Алексей'"),
      birthdate: z.string().optional().describe("Date of birth, e.g. '12.03.1990'"),
      address: z.string().optional().describe("Address in any format"),
      phone: z.string().optional().describe("Phone number in any format"),
      email: z.string().optional().describe("Email address"),
      passport: z.string().optional().describe("Passport series and number, e.g. '45 04 346825'"),
    },
    withErrorHandling(async (params) => {
      // Build structure and data arrays dynamically based on provided fields
      const structure: string[] = [];
      const data: string[] = [];

      if (params.name) { structure.push("NAME"); data.push(params.name); }
      if (params.birthdate) { structure.push("BIRTHDATE"); data.push(params.birthdate); }
      if (params.address) { structure.push("ADDRESS"); data.push(params.address); }
      if (params.phone) { structure.push("PHONE"); data.push(params.phone); }
      if (params.email) { structure.push("EMAIL"); data.push(params.email); }
      if (params.passport) { structure.push("PASSPORT"); data.push(params.passport); }

      if (structure.length === 0) {
        return error("At least one field must be provided (name, birthdate, address, phone, email, or passport).");
      }

      const secretKey = getSecretKey();
      if (!secretKey) {
        return error(
          "DADATA_SECRET_KEY is required for clean_person. " +
          "Add it to your MCP client env config. Get it at https://dadata.ru/profile/#info",
        );
      }

      // Composite clean endpoint uses a special body format
      let apiKey: string;
      try {
        apiKey = getApiKey();
      } catch {
        return error("DADATA_API_KEY is not set.");
      }

      const body = {
        structure,
        data: [data],
      };

      try {
        const response = await fetch("https://cleaner.dadata.ru/api/v1/clean", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Token ${apiKey}`,
            "X-Secret": secretKey,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const statusMessages: Record<number, string> = {
            401: "Authentication failed. Check DADATA_API_KEY.",
            402: "Insufficient balance.",
            403: "Access forbidden. Check DADATA_SECRET_KEY.",
            429: "Rate limit exceeded. Wait before retrying.",
          };
          return error(statusMessages[response.status] ?? `DaData API error (HTTP ${response.status}).`);
        }

        const result = await response.json() as { structure: string[]; data: unknown[][] };

        // Map structure names to results
        const output: Record<string, unknown> = {};
        const row = result.data?.[0] ?? [];
        for (let i = 0; i < structure.length; i++) {
          output[structure[i].toLowerCase()] = row[i] ?? null;
        }

        return success({
          fields_checked: structure.length,
          structure: structure,
          results: output,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return error(`Network error: ${message}`);
      }
    }),
  );
}
