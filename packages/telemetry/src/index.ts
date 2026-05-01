import type { TelemetryConfig } from './types.js';
import { getConsent } from './consent.js';
import { buildPayload } from './payload.js';
import { send } from './transport.js';

const DEFAULT_ENDPOINT = 'https://telemetry.wwmcp.dev/v1/ping';
const DEFAULT_TIMEOUT = 1000;

let pinged = false;

export function ping(config: TelemetryConfig): void {
  if (pinged) return;  // one ping per process
  pinged = true;

  if (getConsent() !== 'allow') return;

  const payload = buildPayload(config.pkg, config.version);
  void send(payload, config.endpoint ?? DEFAULT_ENDPOINT, config.timeoutMs ?? DEFAULT_TIMEOUT);
}

export type { TelemetryConfig, Payload, ConsentDecision } from './types.js';
