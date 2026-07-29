/**
 * Shared zod field schemas for OData input validation.
 *
 * Centralised here so every tool that takes a Ref_Key or a date validates it
 * identically, and the LLM gets one consistent, actionable error message.
 * The security-critical guard for keyed paths lives in `buildKeyedPath`
 * (client.ts); these schemas validate at the MCP input boundary on top of it.
 */
import { z } from "zod";
import { GUID_RE } from "./client.js";

/** A 1C Ref_Key (GUID). */
export const refKeySchema = z
  .string()
  .regex(
    GUID_RE,
    "ref_key must be a 1C Ref_Key GUID, e.g. 01234567-89ab-cdef-0123-456789abcdef",
  );

/** OData date-only literal: YYYY-MM-DD. */
export const odataDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

/** OData datetime literal: YYYY-MM-DDTHH:MM:SS. */
export const odataDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    "must be in YYYY-MM-DDTHH:MM:SS format",
  );
