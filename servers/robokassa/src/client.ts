import { createHash } from "node:crypto";
import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("robokassa-mcp");
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;

export class RobokassaClient {
  private login: string;
  private password1: string;
  private password2: string;
  private isTest: boolean;

  constructor() {
    this.login = process.env.ROBOKASSA_LOGIN ?? "";
    this.password1 = process.env.ROBOKASSA_PASSWORD1 ?? "";
    this.password2 = process.env.ROBOKASSA_PASSWORD2 ?? "";
    this.isTest = process.env.ROBOKASSA_TEST === "true";

    if (!this.login || !this.password1 || !this.password2) {
      throw new Error(
        "Переменные окружения ROBOKASSA_LOGIN, ROBOKASSA_PASSWORD1 и ROBOKASSA_PASSWORD2 обязательны. " +
        "Получите их в личном кабинете Robokassa: Настройки -> Технические настройки"
      );
    }
  }

  /** MD5 hash helper */
  md5(input: string): string {
    return createHash("md5").update(input).digest("hex");
  }

  /**
   * Generate payment URL.
   * Signature = MD5(MerchantLogin:OutSum:InvId:Receipt:Password1) if receipt present,
   * otherwise MD5(MerchantLogin:OutSum:InvId:Password1)
   */
  generatePaymentUrl(params: {
    outSum: number;
    invId: number;
    description: string;
    email?: string;
    culture?: string;
    expirationDate?: string;
    receipt?: string;
  }): string {
    const baseUrl = "https://auth.robokassa.ru/Merchant/Index.aspx";
    const sumStr = params.outSum.toFixed(2);

    let signatureSource: string;
    if (params.receipt) {
      signatureSource = `${this.login}:${sumStr}:${params.invId}:${params.receipt}:${this.password1}`;
    } else {
      signatureSource = `${this.login}:${sumStr}:${params.invId}:${this.password1}`;
    }
    const signature = this.md5(signatureSource);

    const urlParams = new URLSearchParams();
    urlParams.set("MerchantLogin", this.login);
    urlParams.set("OutSum", sumStr);
    urlParams.set("InvId", String(params.invId));
    urlParams.set("Description", params.description);
    urlParams.set("SignatureValue", signature);

    if (params.receipt) urlParams.set("Receipt", params.receipt);
    if (params.email) urlParams.set("Email", params.email);
    if (params.culture) urlParams.set("Culture", params.culture);
    if (params.expirationDate) urlParams.set("ExpirationDate", params.expirationDate);
    if (this.isTest) urlParams.set("IsTest", "1");

    return `${baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Check invoice status via XML interface OpStateExt.
   * Signature = MD5(MerchantLogin:InvoiceID:Password2)
   */
  async checkInvoiceStatus(invoiceId: number): Promise<string> {
    const signatureSource = `${this.login}:${invoiceId}:${this.password2}`;
    const signature = this.md5(signatureSource);

    const url =
      "https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt" +
      `?MerchantLogin=${encodeURIComponent(this.login)}` +
      `&InvoiceID=${invoiceId}` +
      `&Signature=${signature}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (response.ok) return response.text();

        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
          logger.warn(`${response.status}, retry in ${delay}ms`, { attempt, maxRetries: MAX_RETRIES });
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        throw new Error(`Robokassa HTTP ${response.status}: ${await response.text()}`);
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError") {
          if (attempt < MAX_RETRIES) {
            logger.warn("Timeout, retrying", { attempt, maxRetries: MAX_RETRIES });
            continue;
          }
          throw new Error("Robokassa: request timeout (10s). Try again later.");
        }
        throw error;
      }
    }

    throw new Error("Robokassa: all retries exhausted");
  }
}
