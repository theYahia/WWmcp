export interface RoistatAnalyticsResponse {
  data: RoistatAnalyticsData[];
  total: Record<string, number>;
  status: string;
}

export interface RoistatAnalyticsData {
  title: string;
  marker_level: string;
  values: Record<string, number>;
  items?: RoistatAnalyticsData[];
}

export interface RoistatVisitListResponse {
  data: RoistatVisit[];
  total: number;
  status: string;
}

export interface RoistatVisit {
  id: string;
  date_create: string;
  source: string;
  landing_page: string;
  ip: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface RoistatLeadsResponse {
  data: Record<string, unknown>[];
  total: number;
  status: string;
}

export interface RoistatIntegration {
  title: string;
  type: string;
  status: string;
  settings?: Record<string, unknown>;
}

export interface RoistatIntegrationsResponse {
  integrations: RoistatIntegration[];
  status: string;
}
