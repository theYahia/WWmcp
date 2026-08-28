export interface SmsResponse {
  message_id?: string;
  status?: string;
  error?: string;
}

export interface SmsStatusResponse {
  message_id: string;
  status: string;
  delivered_at?: string;
}

export interface CallResponse {
  call_id?: string;
  status?: string;
  error?: string;
}

export interface CallStatusResponse {
  call_id: string;
  status: string;
  duration?: number;
}

export interface CallRecordingResponse {
  call_id: string;
  recording_url?: string;
  duration?: number;
}

export interface PhoneNumber {
  number: string;
  type: string;
  region: string;
  status: string;
}

export interface ListNumbersResponse {
  numbers: PhoneNumber[];
}

export interface BuyNumberResponse {
  number: string;
  status: string;
}

export interface ViberResponse {
  message_id?: string;
  status?: string;
  error?: string;
}
