/**
 * Vitest global setup — runs BEFORE any test file imports the moysklad client.
 *
 * The src/client.ts module instantiates RateLimitedClient + DualAuthStrategy
 * at module load time, which throws "Auth not configured" if neither
 * MOYSKLAD_TOKEN nor MOYSKLAD_LOGIN+PASSWORD is set. Setting the env var here
 * makes the auth strategy happy; per-test `vi.stubGlobal("fetch", ...)` then
 * intercepts the actual HTTP traffic.
 */
process.env["MOYSKLAD_TOKEN"] = process.env["MOYSKLAD_TOKEN"] ?? "test-token-fixture";
