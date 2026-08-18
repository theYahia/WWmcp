export interface UnisenderList {
  id: number;
  title: string;
  count: number;
}

export interface UnisenderContact {
  email: string;
  status: string;
  lists: number[];
}

export interface UnisenderApiResponse {
  result: unknown;
  error?: string;
  code?: string;
}
