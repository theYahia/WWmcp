export interface SendPulseMailingList {
  id: number;
  name: string;
  all_email_qty: number;
  active_email_qty: number;
  inactive_email_qty: number;
  creationdate: string;
}

export interface SendPulseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SendPulseStatistics {
  id: number;
  name: string;
  send_date: string;
  status: number;
  all_email_qty: number;
  sent_email_qty: number;
  open_count: number;
  open_rate: number;
  click_count: number;
  click_rate: number;
}
