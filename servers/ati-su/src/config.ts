/**
 * Runtime configuration for the ATI.su MCP server.
 *
 * The real ATI.su API multiplexes several version/gateway prefixes
 * (v1.0 deprecated, v1.1, v2, /gw/* services, /oauth2) on a single origin,
 * so we keep only origins + feature flags here and let each tool own its
 * full request path. Flags are read live from the environment (via getters)
 * so tests and clients can toggle them without re-importing the module.
 */

/** Reads a boolean-ish env var: "1" / "true" (case-insensitive) → true. */
export function envFlag(name: string): boolean {
  const v = process.env[name];
  return v === "1" || (typeof v === "string" && v.toLowerCase() === "true");
}

export const config = {
  /** Whether to target the ATI.su sandbox instead of production. */
  get sandbox(): boolean {
    return envFlag("ATI_SANDBOX");
  },
  /** Main REST origin. */
  get apiHost(): string {
    return this.sandbox ? "https://sandbox-api.ati.su" : "https://api.ati.su";
  },
  /** OAuth2 identity origin (interactive authorize lives here; not used by the stdio server). */
  get idHost(): string {
    return "https://id.ati.su";
  },
  /**
   * OAuth2 token-exchange endpoint.
   * TODO(verify): docs show `POST https://api.ati.su/oauth2/token`; a `/gw/oauth2/token`
   * twin may also exist. Flip the path here if a live token exchange 404s.
   */
  get tokenUrl(): string {
    return `${this.apiHost}/oauth2/token`;
  },
  /** Whether state-mutating tools (create_load) are permitted to actually write. */
  get allowWrites(): boolean {
    return envFlag("ATI_ALLOW_WRITES");
  },
  /** Whether the PAID distance API (POST /gw/gis-rm/v1/distance) is enabled. */
  get enableDistance(): boolean {
    return envFlag("ATI_ENABLE_DISTANCE");
  },
};
