import type { ConsentDecision } from './types.js';

export function getConsent(): ConsentDecision {
  const val = (process.env['WWMCP_TELEMETRY'] || '').toLowerCase().trim();
  if (val === 'on' || val === '1' || val === 'true') return 'allow';
  if (val === 'off' || val === '0' || val === 'false') return 'deny';
  // Default OFF — never collect without explicit opt-in
  return 'deny';
}
