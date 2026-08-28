export interface CdekTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
}

export interface CdekError {
  code: string;
  message: string;
}

export interface CdekRequest {
  errors?: CdekError[];
  requests?: Array<{
    request_uuid: string;
    type: string;
    state: string;
    errors?: CdekError[];
  }>;
}

export interface TariffResult {
  delivery_sum: number;
  period_min: number;
  period_max: number;
  weight_calc: number;
  currency: string;
  errors?: CdekError[];
}

export interface CdekOrder {
  entity?: {
    uuid: string;
    cdek_number?: string;
    is_return: boolean;
    is_reverse: boolean;
    type: number;
    statuses?: CdekStatus[];
    delivery_detail?: {
      date: string;
      recipient_name?: string;
    };
  };
  requests?: CdekRequest["requests"];
  related_entities?: Array<{ uuid: string; type: string }>;
  errors?: CdekError[];
}

export interface CdekStatus {
  code: string;
  name: string;
  date_time: string;
  city: string;
}

export interface CdekCity {
  code: number;
  city: string;
  fias_guid?: string;
  country_code: string;
  region: string;
  sub_region?: string;
}

export interface CdekDeliveryPoint {
  code: string;
  name: string;
  location: {
    country_code: string;
    region_code: number;
    city_code: number;
    city: string;
    address: string;
    postal_code?: string;
    longitude: number;
    latitude: number;
  };
  type: string;
  owner_code: string;
  work_time: string;
  is_dressing_room: boolean;
  have_cashless: boolean;
  have_cash: boolean;
}
