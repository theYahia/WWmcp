export interface AmoCRMLead {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  created_at: number;
  updated_at: number;
  closed_at: number | null;
  closest_task_at: number | null;
  custom_fields_values: AmoCRMCustomField[] | null;
  _embedded?: Record<string, unknown>;
}

export interface AmoCRMContact {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  responsible_user_id: number;
  created_at: number;
  updated_at: number;
  custom_fields_values: AmoCRMCustomField[] | null;
  _embedded?: Record<string, unknown>;
}

export interface AmoCRMCompany {
  id: number;
  name: string;
  responsible_user_id: number;
  created_at: number;
  updated_at: number;
  custom_fields_values: AmoCRMCustomField[] | null;
  _embedded?: Record<string, unknown>;
}

export interface AmoCRMTask {
  id: number;
  text: string;
  entity_id: number;
  entity_type: string;
  complete_till: number;
  task_type_id: number;
  is_completed: boolean;
  result: { text: string } | null;
  responsible_user_id: number;
  created_at: number;
  updated_at: number;
}

export interface AmoCRMPipeline {
  id: number;
  name: string;
  sort: number;
  is_main: boolean;
  is_unsorted_on: boolean;
  is_archive: boolean;
  _embedded?: {
    statuses: AmoCRMStatus[];
  };
}

export interface AmoCRMStatus {
  id: number;
  name: string;
  sort: number;
  is_editable: boolean;
  pipeline_id: number;
  color: string;
  type: number;
}

export interface AmoCRMCustomField {
  field_id: number;
  field_name: string;
  field_type: string;
  values: { value: unknown; enum_id?: number }[];
}

export interface AmoCRMEvent {
  id: string;
  type: string;
  entity_id: number;
  entity_type: string;
  created_at: number;
  value_before: unknown[];
  value_after: unknown[];
  account_id: number;
}

export interface AmoCRMListResponse<T> {
  _page: number;
  _links: Record<string, unknown>;
  _embedded: Record<string, T[]>;
}

export interface AmoCRMError {
  title: string;
  type: string;
  status: number;
  detail: string;
}
