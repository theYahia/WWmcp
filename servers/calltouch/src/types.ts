export interface CalltouchCall {
  id: number;
  date: string;
  duration: number;
  caller_number: string;
  source: string;
  status: string;
  is_target: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface CalltouchCallsResponse {
  records: CalltouchCall[];
  total: number;
  page: number;
  page_size: number;
}

export interface CalltouchStatisticsResponse {
  data: CalltouchStatItem[];
  total: CalltouchStatTotals;
}

export interface CalltouchStatItem {
  date: string;
  calls_count: number;
  unique_calls: number;
  target_calls: number;
  missed_calls: number;
}

export interface CalltouchStatTotals {
  calls_count: number;
  unique_calls: number;
  target_calls: number;
  missed_calls: number;
}
