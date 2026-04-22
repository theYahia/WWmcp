/**
 * Wildberries Seller API HTTP client with production-grade rate limiting.
 */
import { RateLimiter } from "./rate-limiter.js";

export interface WBClientOptions {
  token: string;
  baseUrl?: string;
  maxRetries?: number;
}

export class WBClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly limiter: RateLimiter;
  private readonly maxRetries: number;

  constructor(options: WBClientOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl ?? "https://seller.wildberries.ru";
    this.limiter = new RateLimiter(300, 200);
    this.maxRetries = options.maxRetries ?? 3;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string>,
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      await this.limiter.acquire();

      const init: RequestInit = {
        method,
        headers: this.headers(),
      };
      if (body !== undefined) {
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url, init);

      // Handle 409 penalty
      if (response.status === 409) {
        this.limiter.applyPenalty(5);
        const waitMs = this.limiter.handlePenalty(response.headers);
        if (attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        lastError = new Error(
          `WB API ${method} ${path} returned ${response.status}: ${text}`,
        );
        if (response.status >= 500 && attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw lastError;
      }

      // Some endpoints return 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    }

    throw lastError ?? new Error(`WB API ${method} ${path} failed after ${this.maxRetries} retries`);
  }

  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, undefined, params);
  }

  async post<T = unknown>(path: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    return this.request<T>("POST", path, body, params);
  }

  async put<T = unknown>(path: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    return this.request<T>("PUT", path, body, params);
  }

  async patch<T = unknown>(path: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    return this.request<T>("PATCH", path, body, params);
  }
}
