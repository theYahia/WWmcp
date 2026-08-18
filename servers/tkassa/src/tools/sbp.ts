import { z } from "zod";
import { TKassaClient } from "../client.js";

let _client: TKassaClient | null = null;
function getClient(): TKassaClient {
  if (!_client) _client = new TKassaClient();
  return _client;
}

export const createSbpQrSchema = z.object({
  payment_id: z.string()
    .describe("ID платежа (из init_payment) для генерации QR-кода СБП"),
  data_type: z.enum(["PAYLOAD", "IMAGE"]).default("PAYLOAD")
    .describe("PAYLOAD = ссылка для оплаты, IMAGE = base64 PNG с QR-кодом"),
});

export const getSbpQrStateSchema = z.object({
  payment_id: z.string().describe("ID платежа для проверки статуса QR СБП"),
});

export async function handleCreateSbpQr(params: z.infer<typeof createSbpQrSchema>): Promise<string> {
  return JSON.stringify(
    await getClient().post("/SbpPay", { PaymentId: params.payment_id, DataType: params.data_type }),
    null, 2
  );
}

export async function handleGetSbpQrState(params: z.infer<typeof getSbpQrStateSchema>): Promise<string> {
  return JSON.stringify(
    await getClient().post("/GetSbpPaymentStatus", { PaymentId: params.payment_id }),
    null, 2
  );
}
