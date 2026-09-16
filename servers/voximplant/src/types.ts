export interface VoxCall {
  call_session_history_id: number;
  account_id: number;
  start_date: string;
  duration?: number;
  cost?: number;
  remote_number?: string;
}

export interface VoxUser {
  user_id: number;
  user_name: string;
  user_display_name?: string;
  user_active?: boolean;
}

export interface VoxSmsResult {
  result: number;
  message_id?: string;
}

export interface VoxAccountInfo {
  account_id: number;
  account_name: string;
  account_email?: string;
  api_key?: string;
  live_balance?: number;
  currency?: string;
}

export interface VoxScenario {
  scenario_id: number;
  scenario_name: string;
  scenario_script?: string;
  modified?: string;
}

export interface VoxRule {
  rule_id: number;
  rule_name: string;
  rule_pattern: string;
  scenario_id?: number;
  scenario_name?: string;
}

/** Стандартный конверт списочного ответа Platform API. */
export interface VoxListResponse<T> {
  result?: T[];
  total_count?: number;
  count?: number;
  [key: string]: unknown;
}
