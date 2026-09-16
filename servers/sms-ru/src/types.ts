export interface SmsRuSendResult {
  status: string;
  status_code: number;
  sms: Record<string, { status: string; status_code: number; sms_id?: string }>;
  balance: number;
}

export interface SmsRuStatusResult {
  status: string;
  status_code: number;
  sms: Record<string, { status: string; status_code: number; status_text?: string }>;
}

export interface SmsRuBalanceResult {
  status: string;
  status_code: number;
  balance: number;
}
