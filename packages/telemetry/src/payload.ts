import type { Payload } from './types.js';

const TZ_TO_COUNTRY: Record<string, string> = {
  'Europe/Moscow': 'RU', 'Europe/Samara': 'RU', 'Europe/Kaliningrad': 'RU',
  'Asia/Yekaterinburg': 'RU', 'Asia/Novosibirsk': 'RU', 'Asia/Vladivostok': 'RU',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'NL', 'Europe/Warsaw': 'PL', 'Europe/Kiev': 'UA',
  'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
  'Asia/Singapore': 'SG', 'Asia/Kolkata': 'IN', 'Asia/Dubai': 'AE',
  'America/Sao_Paulo': 'BR', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
};

function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_TO_COUNTRY[tz] || 'XX';
  } catch {
    return 'XX';
  }
}

function detectUseCase(): Payload['useCase'] {
  if (process.env['CI'] || process.env['GITHUB_ACTIONS'] || process.env['GITLAB_CI']) return 'ci';
  if (process.env['NODE_ENV'] === 'production') return 'production';
  if (process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'test') return 'dev';
  return 'unknown';
}

export function buildPayload(pkg: string, version: string): Payload {
  return {
    pkg,
    version,
    ts: new Date().toISOString(),
    country: detectCountry(),
    useCase: detectUseCase(),
  };
}
