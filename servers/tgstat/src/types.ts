/**
 * TGStat API types.
 *
 * Every TGStat endpoint wraps its payload in an envelope:
 *   success:  { "status": "ok",    "response": {...} | [...] }
 *   error:    { "status": "error", "error": "message" }   (still HTTP 200)
 *
 * The client unwraps this envelope and normalises both transport and logical
 * errors into the {@link ApiResult} shape, so tool handlers never have to think
 * about the envelope or about throwing.
 */

/** Result of an API call — either data or a human-readable error, never both. */
export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
}

/** Raw TGStat response envelope. */
export interface TgstatEnvelope<T = unknown> {
  status: "ok" | "error" | string;
  response?: T;
  error?: string;
}
