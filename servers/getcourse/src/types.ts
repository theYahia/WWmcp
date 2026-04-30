export interface GetCourseUser {
  id: number;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  status?: string;
  fields?: Record<string, unknown>;
}

export interface GetCourseDeal {
  id: number;
  user_id?: number;
  offer_id?: number;
  deal_number?: string;
  deal_cost?: number;
  deal_status?: string;
  deal_created_at?: string;
  deal_finished_at?: string;
  deal_comment?: string;
  position_name?: string;
}

export interface GetCourseExportResponse {
  success: boolean;
  error?: boolean;
  error_message?: string;
  info?: {
    export_id: number;
  };
}

export interface GetCourseExportResult {
  success: boolean;
  error?: boolean;
  error_message?: string;
  info?: {
    items: Array<Record<string, unknown>>;
    count?: number;
  };
}

export interface GetCourseCreateUserResponse {
  success: boolean;
  error?: boolean;
  error_message?: string;
  result?: {
    user_id?: number;
    added_to_group?: boolean;
    added_to_deal?: boolean;
  };
}
