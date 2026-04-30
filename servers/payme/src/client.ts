import { createLogger } from "@theyahia/mcp-core";
import type { JsonRpcRequest, JsonRpcResponse } from "./types.js";

const SANDBOX_URL = "https://checkout.test.paycom.uz/api";
const PRODUCTION_URL = "https://checkout.paycom.uz/api";

const logger = createLogger("payme-mcp");

export class PaymeError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown,
  ) {
    super(`Payme error ${code}: ${message}`);
    this.name = "PaymeError";
  }
}

export class JsonRpcClient {
  private counter = 0;
  private baseUrl: string;
  private authHeader: string;

  constructor(
    cashboxId: string,
    key: string,
    sandbox: boolean = true,
  ) {
    this.baseUrl = sandbox ? SANDBOX_URL : PRODUCTION_URL;
    this.authHeader = `${cashboxId}:${key}`;
  }

  async call(method: string, params: Record<string, unknown>): Promise<unknown> {
    const body: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: ++this.counter,
      method,
      params,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": this.authHeader,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const json = (await response.json()) as JsonRpcResponse;

      if (json.error) {
        throw new PaymeError(json.error.code, json.error.message, json.error.data);
      }

      return json.result;
    } finally {
      clearTimeout(timeout);
    }
  }
}
