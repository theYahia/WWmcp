/**
 * 2GIS HTTP client.
 *
 * API: https://api.2gis.ru/
 *
 * Security:
 *   - API key read from env at call time
 *   - Keys never in error messages
 *   - Hard timeout (10s), retries on transient errors
 */

import type { ApiResult } from "./types.js";

const API_BASE = "https://catalog.api.2gis.com/3.0";
const ROUTING_BASE = "https://routing.api.2gis.com/routing/7.0.0/global";
const SUGGEST_BASE = "https://catalog.api.2gis.com/3.0/suggests";
const REVIEWS_BASE = "https://public-api.reviews.2gis.com/2.0";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 8_000;

export function getApiKey(): string {
  const key = process.env.TWOGIS_API_KEY;
  if (!key) {
    throw new Error(
      "TWOGIS_API_KEY is not set. " +
      "Get your key at https://dev.2gis.com/ and add it to your MCP client env config."
    );
  }
  return key;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mapHttpError(status: number): string {
  switch (status) {
    case 400: return "Bad request. Check parameters.";
    case 401: return "Authentication failed. Check TWOGIS_API_KEY.";
    case 403: return "Access forbidden. Check your API key permissions.";
    case 429: return "Rate limit exceeded. Wait before retrying.";
    default:
      if (status >= 500) return `2GIS service error (HTTP ${status}). Try again later.`;
      return `Unexpected HTTP ${status} from 2GIS API.`;
  }
}

async function callGET(url: string): Promise<ApiResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        return { data: await response.json(), error: null };
      }

      const isTransient = response.status === 429 || response.status >= 500;
      if (isTransient && attempt < MAX_RETRIES) {
        const waitMs = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), BACKOFF_MAX_MS);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      return { data: null, error: mapHttpError(response.status) };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, error: "Request timed out (10s). 2GIS may be experiencing issues." };
      }
      if (attempt < MAX_RETRIES) continue;
      const message = err instanceof Error ? err.message : "Unknown network error";
      return { data: null, error: `Network error: ${message}` };
    }
  }
  return { data: null, error: "Max retries exceeded." };
}

async function callPOST(url: string, body: unknown): Promise<ApiResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return { data: await response.json(), error: null };
      }

      const isTransient = response.status === 429 || response.status >= 500;
      if (isTransient && attempt < MAX_RETRIES) {
        const waitMs = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), BACKOFF_MAX_MS);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      return { data: null, error: mapHttpError(response.status) };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, error: "Request timed out (10s)." };
      }
      if (attempt < MAX_RETRIES) continue;
      const message = err instanceof Error ? err.message : "Unknown network error";
      return { data: null, error: `Network error: ${message}` };
    }
  }
  return { data: null, error: "Max retries exceeded." };
}

// --- Public API methods ---

export async function searchItems(params: Record<string, string>): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const query = new URLSearchParams({ key: apiKey, ...params });
  return callGET(`${API_BASE}/items?${query}`);
}

export async function getItem(id: string, fields?: string): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params: Record<string, string> = { key: apiKey, id };
  if (fields) params.fields = fields;
  const query = new URLSearchParams(params);
  return callGET(`${API_BASE}/items/byid?${query}`);
}

export async function geocodeAddress(query: string): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params = new URLSearchParams({ key: apiKey, q: query, fields: "items.point,items.address" });
  return callGET(`${API_BASE}/items/geocode?${params}`);
}

export async function reverseGeocode(lat: number, lon: number): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params = new URLSearchParams({
    key: apiKey,
    lat: String(lat),
    lon: String(lon),
    fields: "items.point,items.address",
  });
  return callGET(`${API_BASE}/items/geocode?${params}`);
}

export async function getDirections(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  mode: string = "driving",
): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const body = {
    locale: "ru",
    transport: mode,
    points: [
      { type: "stop", lat: origin.lat, lon: origin.lon },
      { type: "stop", lat: destination.lat, lon: destination.lon },
    ],
  };
  const params = new URLSearchParams({ key: apiKey });
  return callPOST(`${ROUTING_BASE}?${params}`, body);
}

export async function suggest(query: string, point?: { lat: number; lon: number }): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params: Record<string, string> = { key: apiKey, q: query, locale: "ru_RU" };
  if (point) params.point = `${point.lon},${point.lat}`;
  const qs = new URLSearchParams(params);
  return callGET(`${SUGGEST_BASE}?${qs}`);
}

export async function searchByRubric(rubricId: string, point: string, radius: number): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params = new URLSearchParams({
    key: apiKey,
    rubric_id: rubricId,
    point,
    radius: String(radius),
    fields: "items.point,items.address,items.contact_groups",
  });
  return callGET(`${API_BASE}/items?${params}`);
}

export async function getReviews(placeId: string, limit: number = 10): Promise<ApiResult> {
  let apiKey: string;
  try { apiKey = getApiKey(); } catch {
    return { data: null, error: "TWOGIS_API_KEY is not set." };
  }
  const params = new URLSearchParams({
    key: apiKey,
    place_id: placeId,
    limit: String(limit),
    sort_by: "date_created",
    is_advertiser: "false",
  });
  return callGET(`${REVIEWS_BASE}/branches/${placeId}/reviews?${params}`);
}
