/**
 * @theyahia/mcp-core — shared library for MCP servers
 *
 * Provides: error handling, formatting, logging, HTTP client,
 * auth strategies, server factory with dual transport.
 */

// Errors
export { createToolError, withErrorHandling } from "./errors.js";
export type { ErrorCategory, ApiErrorInfo } from "./errors.js";

// Formatting
export {
  formatResponse,
  formatRUB,
  formatUZS,
  formatKZT,
  formatDate,
  formatNumber,
} from "./format.js";

// Logging
export { createLogger } from "./logging.js";
export type { Logger, LogLevel } from "./logging.js";

// HTTP Client
export {
  BaseHttpClient,
  RateLimitedClient,
  TokenBucketLimiter,
  ApiError,
} from "./client.js";
export type { BaseClientOptions, RequestOptions } from "./client.js";

// Auth Strategies
export {
  ApiKeyStrategy,
  BasicAuthStrategy,
  OAuthStrategy,
  DualAuthStrategy,
  NoAuthStrategy,
} from "./auth/index.js";
export type { AuthStrategy } from "./auth/index.js";

// Sanitization
export { sanitizeApiResponse, truncateResponse } from "./sanitize.js";

// Server Factory
export { runServer, startStdio, startHttp } from "./server.js";
export type { ServerConfig, HttpServerConfig } from "./server.js";
