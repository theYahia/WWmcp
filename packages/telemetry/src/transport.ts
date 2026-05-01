import type { Payload } from './types.js';
import { request } from 'node:https';
import { request as httpRequest } from 'node:http';

export async function send(payload: Payload, endpoint: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const url = new URL(endpoint);
    const isHttps = url.protocol === 'https:';
    const req = (isHttps ? request : httpRequest)(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'wwmcp-telemetry/0.1.0',
        },
        timeout: timeoutMs,
      },
      () => resolve(),  // any response = success
    );
    req.on('error', () => resolve());   // fire-and-forget: never throw
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}
