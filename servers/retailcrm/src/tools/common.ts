import { z } from "zod";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dateField = (desc: string) =>
  z.string().regex(DATE_RE, "Date must be in YYYY-MM-DD format").describe(desc);

export const detailField = z.enum(["summary", "full"]).default("summary")
  .describe("Output verbosity: 'summary' (compact, default — saves tokens) or 'full' (all shaped fields incl. line items, delivery, payments).");

export const rawField = z.boolean().optional()
  .describe("If true, return the untouched RetailCRM payload (for debugging; verbose).");

export const siteField = z.string().optional()
  .describe("Site (store) symbolic code. Required on create/edit when the API key is scoped to multiple sites (see list_sites).");

export const pageField = z.number().int().min(1).default(1).describe("Page number");

export const limitField = z.number().int().min(1).max(100).default(20)
  .describe("Results per page (max 100)");
