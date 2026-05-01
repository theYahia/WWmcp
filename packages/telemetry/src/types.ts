export interface TelemetryConfig {
  pkg: string;        // e.g. "@theyahia/voximplant-mcp"
  version: string;    // package version
  endpoint?: string;  // default: "https://telemetry.wwmcp.dev/v1/ping"
  timeoutMs?: number; // default: 1000
}

export type ConsentDecision = 'allow' | 'deny' | 'unset';

export interface Payload {
  pkg: string;
  version: string;
  ts: string;       // ISO 8601, rounded to hour server-side
  country: string;  // 2-letter ISO from Intl.DateTimeFormat timezone mapping
  useCase: 'ci' | 'dev' | 'production' | 'unknown';
}
