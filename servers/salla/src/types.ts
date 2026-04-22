export interface SallaProduct {
  id: number;
  name: string;
  price: { amount: number; currency: string };
  status: string;
  quantity?: number;
  description?: string;
}

export interface SallaOrder {
  id: number;
  reference_id: string;
  status: { id: number; name: string };
  total: { amount: number; currency: string };
  customer?: { id: number; first_name: string };
}

export interface SallaCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
}

export interface SallaApiResponse {
  status: number;
  data: unknown;
  [key: string]: unknown;
}
