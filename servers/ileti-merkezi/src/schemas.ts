import { z } from "zod";

/**
 * Reusable zod validators + per-tool input shapes.
 *
 * Each exported `*Shape` is a ZodRawShape passed straight to McpServer
 * `registerTool`, so the tool's JSON Schema and runtime validation come from a
 * single source. Validation is intentionally a touch permissive (the API is the
 * final authority and returns precise status codes), but it catches the obvious
 * mistakes before a billable call is made.
 */

// Turkish mobile MSISDN: 5XXXXXXXXX, optionally prefixed with 0, 90 or +90.
const PHONE_RE = /^(?:\+?90|0)?5\d{9}$/;
export const phone = z
  .string()
  .trim()
  .regex(PHONE_RE, "Expected a Turkish mobile number, e.g. 5XXXXXXXXX or 905XXXXXXXXXX");

// Approved sender header (başlık): 3–11 chars. APITEST is the provider sandbox.
export const senderHeader = z
  .string()
  .trim()
  .min(3, "Sender header must be at least 3 characters")
  .max(11, "Sender header must be at most 11 characters");

const dateYmd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date as YYYY-MM-DD");

const dateTimeYmdHms = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Expected datetime as YYYY-MM-DD HH:MM:SS");

const scheduleAt = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, "Expected schedule as DD/MM/YYYY HH:MM");

const orderId = z.union([z.string().trim().min(1), z.number().int().positive()]);

// İYS enums.
const recipientType = z.enum(["BIREYSEL", "TACIR"]);
const consentChannel = z.enum(["MESAJ", "EPOSTA", "ARAMA"]);
const consentStatus = z.enum(["ONAY", "RET"]);
// İYS consent source codes (HS_* family). Kept open-ended via string to avoid
// rejecting valid-but-rarer sources; documented common values in the enum hint.
const consentSource = z
  .string()
  .trim()
  .min(1)
  .describe("İYS consent source, e.g. HS_WEB, HS_MOBIL, HS_MESAJ, HS_EPOSTA, HS_CAGRI_MERKEZI");

// ---------------------------------------------------------------------------
// Per-tool input shapes
// ---------------------------------------------------------------------------

export const sendSmsShape = {
  to: z
    .union([phone, z.array(phone).min(1).max(50_000)])
    .describe("Recipient(s): a single Turkish mobile number or an array (bulk, up to 50000)."),
  message: z.string().min(1, "Message text cannot be empty").describe("SMS message text."),
  sender: senderHeader
    .optional()
    .describe(
      "Approved sender header (başlık), 3–11 chars. Use APITEST for sandbox sends. " +
        "Falls back to env ILETIMERKEZI_SENDER / ILETI_SENDER if omitted.",
    ),
  message_type: z
    .enum(["transactional", "commercial"])
    .default("transactional")
    .describe(
      "transactional (OTP/notifications/invoices) → İYS consent check skipped (iys=0); " +
        "commercial (marketing) → real-time İYS consent validation (iys=1). " +
        "Turkey Law 6563 requires consent for commercial messages; transactional is exempt. " +
        "Default transactional — set commercial for any marketing content.",
    ),
  iys_list: recipientType
    .default("BIREYSEL")
    .describe("Recipient audience for İYS validation when commercial: BIREYSEL or TACIR."),
  schedule_at: scheduleAt
    .optional()
    .describe("Schedule the send for a future time (DD/MM/YYYY HH:MM). Omit to send now."),
  iys: z
    .enum(["0", "1"])
    .optional()
    .describe("Advanced: explicit İYS flag override. Normally leave unset and use message_type."),
};

export const cancelOrderShape = {
  order_id: orderId.describe("Order ID returned by send_sms (only future-scheduled orders)."),
};

export const getReportShape = {
  order_id: orderId.describe("Order ID to fetch the per-recipient delivery report for."),
  page: z.number().int().min(1).default(1).describe("Page number (1-based)."),
  row_count: z.number().int().min(1).max(1000).default(1000).describe("Rows per page (max 1000)."),
};

export const getReportsShape = {
  start: dateYmd.describe("Range start date (YYYY-MM-DD)."),
  end: dateYmd.describe("Range end date (YYYY-MM-DD). Range must not exceed 10 days."),
  page: z.number().int().min(1).default(1).describe("Page number (1-based)."),
};

export const emptyShape = {} as const;

export const getBlacklistShape = {
  page: z.number().int().min(1).default(1).describe("Page number (1-based)."),
  row_count: z.number().int().min(1).max(1000).default(1000).describe("Rows per page (max 1000)."),
  start: dateTimeYmdHms.optional().describe("Optional filter start (YYYY-MM-DD HH:MM:SS)."),
  end: dateTimeYmdHms.optional().describe("Optional filter end (YYYY-MM-DD HH:MM:SS)."),
};

export const blacklistNumberShape = {
  number: phone.describe("Turkish mobile number to block / unblock."),
};

export const iysRegisterShape = {
  brand_code: z
    .union([z.string().trim().min(1), z.number().int().positive()])
    .describe("İYS brand code (marka kodu) registered for your account."),
  consents: z
    .array(
      z.object({
        recipient: z.string().trim().min(1).describe("Phone number or email address."),
        recipient_type: recipientType.describe("BIREYSEL or TACIR."),
        type: consentChannel.describe("Consent channel: MESAJ, EPOSTA or ARAMA."),
        status: consentStatus.describe("ONAY (consent) or RET (opt-out)."),
        source: consentSource,
        consent_date: dateTimeYmdHms.describe(
          "Consent timestamp (YYYY-MM-DD HH:MM:SS), no older than 3 days.",
        ),
      }),
    )
    .min(1)
    .max(5000)
    .describe("Consent records to register (1–5000, processed atomically)."),
};

export const iysCheckShape = {
  brand_code: z
    .union([z.string().trim().min(1), z.number().int().positive()])
    .describe("İYS brand code (marka kodu) registered for your account."),
  recipient: z.string().trim().min(1).describe("Phone number or email address to look up."),
  recipient_type: recipientType.describe("BIREYSEL or TACIR."),
  type: consentChannel.describe("Consent channel: MESAJ, EPOSTA or ARAMA."),
};
