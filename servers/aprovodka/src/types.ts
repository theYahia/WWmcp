export interface ODataResponse<T = Record<string, unknown>> {
  "odata.metadata"?: string;
  value: T[];
  "odata.count"?: string;
}

export interface CatalogItem {
  Ref_Key: string;
  Code?: string;
  Description?: string;
  DeletionMark?: boolean;
  [key: string]: unknown;
}

export interface Document {
  Ref_Key: string;
  Number?: string;
  Date?: string;
  Posted?: boolean;
  DeletionMark?: boolean;
  [key: string]: unknown;
}

export interface RegisterRecord {
  [key: string]: unknown;
}
