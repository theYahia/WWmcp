import { z } from "zod";
import type { TochkaBankClient } from "../client.js";
import type { PaymentForSignRequest } from "../types.js";
import { accountSchema, bikSchema, innSchema, isoDateSchema } from "../validation.js";
import { jsonResult, type ToolDef } from "./_shared.js";

const DEFAULT_MAX_PAYMENT_RUB = 100_000;

function maxPaymentRub(): number {
  const raw = Number(process.env.TOCHKA_MAX_PAYMENT_RUB);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_PAYMENT_RUB;
}

function allowedRecipients(): string[] {
  return (process.env.TOCHKA_ALLOWED_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Today's date as YYYY-MM-DD in the Moscow timezone (payment dates are MSK). */
function todayMoscow(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface CreatePaymentArgs {
  from_account: string;
  to_account: string;
  to_bik: string;
  to_name: string;
  to_inn?: string;
  amount_rub: number;
  purpose: string;
  payment_date?: string;
  payer_bik?: string;
  confirm?: boolean;
  dry_run?: boolean;
}

export const createPaymentTool: ToolDef = {
  name: "create_payment",
  config: {
    title: "Create payment (for signing)",
    description:
      "Create an outgoing RUB payment in Tochka Bank via the 'for-sign' flow. IMPORTANT: amount is in RUBLES (decimal, e.g. 75000.50) — NOT kopeks. The payment is created but NOT sent: a human must sign it in Tochka internet-bank (SMS). Returns a dry-run preview unless confirm:true is set.",
    inputSchema: {
      from_account: accountSchema.describe("Payer account number (20 digits)"),
      to_account: accountSchema.describe("Recipient account number (20 digits)"),
      to_bik: bikSchema.describe("Recipient bank BIC (9 digits)"),
      to_name: z.string().min(1).describe("Recipient name (required), e.g. 'ООО Ромашка'"),
      to_inn: innSchema.optional().describe("Recipient INN (10 or 12 digits, optional)"),
      amount_rub: z.number().positive().describe("Amount in RUBLES (decimal). NOT kopeks."),
      purpose: z.string().min(1).describe("Payment purpose (назначение платежа)"),
      payment_date: isoDateSchema
        .optional()
        .describe("Payment date YYYY-MM-DD (MSK). Default: today."),
      payer_bik: bikSchema
        .optional()
        .describe("Payer bank BIC (9 digits). Recommended for the for-sign flow."),
      confirm: z.boolean().optional().describe("Must be true to actually create the payment."),
      dry_run: z
        .boolean()
        .optional()
        .describe("If true, always return a preview without creating."),
    },
    outputSchema: {
      status: z.string(),
      requestId: z.string().optional(),
      message: z.string(),
      preview: z.record(z.unknown()).optional(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  handler: async (client: TochkaBankClient, args: CreatePaymentArgs) => {
    const paymentDate = args.payment_date ?? todayMoscow();
    const preview = {
      from_account: args.from_account,
      recipient: args.to_name,
      to_account: args.to_account,
      to_bik: args.to_bik,
      to_inn: args.to_inn,
      amount_rub: args.amount_rub,
      purpose: args.purpose,
      payment_date: paymentDate,
    };

    const limit = maxPaymentRub();
    if (args.amount_rub > limit) {
      return jsonResult({
        status: "blocked",
        message: `Amount ${args.amount_rub} RUB exceeds the TOCHKA_MAX_PAYMENT_RUB limit (${limit}). Raise the limit env var to allow larger payments.`,
        preview,
      });
    }

    const allowlist = allowedRecipients();
    if (allowlist.length > 0 && !allowlist.includes(args.to_account)) {
      return jsonResult({
        status: "blocked",
        message: "Recipient account is not in the TOCHKA_ALLOWED_RECIPIENTS allowlist.",
        preview,
      });
    }

    if (args.dry_run || args.confirm !== true) {
      return jsonResult({
        status: "preview",
        message:
          "Dry run. Re-call create_payment with confirm:true to create this payment. It will then await your signature in Tochka internet-bank (SMS) before any funds move.",
        preview,
      });
    }

    const req: PaymentForSignRequest = {
      accountCode: args.from_account,
      counterpartyAccountNumber: args.to_account,
      counterpartyBankBic: args.to_bik,
      counterpartyName: args.to_name,
      paymentAmount: args.amount_rub,
      paymentDate,
      paymentPurpose: args.purpose,
      ...(args.payer_bik ? { bankCode: args.payer_bik } : {}),
      ...(args.to_inn ? { counterpartyINN: args.to_inn } : {}),
    };
    const result = await client.createPaymentForSign(req);
    return jsonResult({
      status: "created_for_sign",
      requestId: result.requestId,
      message: `Payment created and awaiting signature. Sign it in Tochka internet-bank (SMS) to send the funds. Track it with get_payment_status(request_id='${result.requestId}').`,
      preview,
    });
  },
};

export const getPaymentStatusTool: ToolDef = {
  name: "get_payment_status",
  config: {
    title: "Get payment status",
    description:
      "Check the status of a payment by its requestId (returned by create_payment). Statuses include WaitingForSign, Allowed, Created, Paid, Rejected, Canceled.",
    inputSchema: {
      request_id: z.string().min(1).describe("The payment requestId"),
    },
    outputSchema: {
      requestId: z.string().optional(),
      status: z.string().optional(),
      errors: z.array(z.unknown()).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (client: TochkaBankClient, args: { request_id: string }) => {
    const status = await client.getPaymentStatus(args.request_id);
    return jsonResult({
      requestId: status.requestId,
      status: status.status,
      errors: status.errors,
    });
  },
};
