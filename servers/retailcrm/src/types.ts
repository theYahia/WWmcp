// ── Raw RetailCRM API shapes (what we read from API v5) ──────
// Loose/optional — RetailCRM omits empty fields and varies by config.

export interface RawPhone { number?: string }

export interface RawCustomerRef {
  id?: number;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  email?: string;
  phones?: RawPhone[];
}

export interface RawOrderItem {
  offer?: { displayName?: string; name?: string; article?: string; xmlId?: string };
  productName?: string;
  quantity?: number;
  initialPrice?: number;
  discountTotal?: number;
  prices?: { price?: number; quantity?: number }[];
  status?: string;
}

export interface RawOrder {
  id: number;
  externalId?: string;
  number?: string;
  status?: string;
  statusComment?: string;
  orderType?: string;
  orderMethod?: string;
  source?: { source?: string; medium?: string; campaign?: string } | string;
  totalSumm?: number;
  prepaySum?: number;
  customer?: RawCustomerRef;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  items?: RawOrderItem[];
  createdAt?: string;
  statusUpdatedAt?: string;
  managerComment?: string;
  customerComment?: string;
  delivery?: { code?: string; cost?: number; address?: { text?: string }; service?: { name?: string } };
  payments?: Record<string, { type?: string; amount?: number; status?: string }>;
}

export interface RawCustomer {
  id: number;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  email?: string;
  phones?: RawPhone[];
  address?: { text?: string; city?: string; region?: string; country?: string };
  createdAt?: string;
  ordersCount?: number;
  totalSumm?: number;
  averageSumm?: number;
  customFields?: Record<string, unknown>;
}

export interface RawProduct {
  id: number;
  name?: string;
  article?: string;
  url?: string;
  active?: boolean;
  groups?: { id?: number; name?: string }[];
  offers?: { id?: number; name?: string; price?: number; quantity?: number }[];
}

export interface RetailCrmPagination {
  limit: number;
  totalCount: number;
  currentPage: number;
  totalPageCount: number;
}

// ── Shaped view DTOs (token-efficient output) ────────────────
// Type aliases (not interfaces) so they satisfy MCP structuredContent's
// implicit-index-signature requirement.

export type PaginationView = {
  page: number;
  totalPages: number;
  totalCount: number;
  returned: number;
  hasMore: boolean;
};

export type OrderSummary = {
  id: number;
  number: string | null;
  status: string | null;
  total: number | null;
  customer: string | null;
  phone: string | null;
  itemCount: number;
  createdAt: string | null;
};

export type OrderItemView = {
  name: string;
  quantity: number;
  initialPrice: number;   // unit price before discounts
  discountTotal: number;  // total discount applied to the line
  price: number;          // effective unit price charged (after discounts)
};

export type OrderView = OrderSummary & {
  externalId: string | null;
  orderType: string | null;
  orderMethod: string | null;
  email: string | null;
  statusComment: string | null;
  statusUpdatedAt: string | null;
  managerComment: string | null;
  customerComment: string | null;
  items: OrderItemView[];
  delivery: { code: string | null; cost: number | null; address: string | null } | null;
  payments: { type: string | null; amount: number | null; status: string | null }[];
};

export type CustomerSummary = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  ordersCount: number | null;
  totalSpent: number | null;
};

export type CustomerView = CustomerSummary & {
  externalId: string | null;
  patronymic: string | null;
  phones: string[];
  address: string | null;
  city: string | null;
  region: string | null;
  createdAt: string | null;
};

export type ProductView = {
  id: number;
  name: string | null;
  article: string | null;
  active: boolean;
  url: string | null;
  groups: string[];
  offers: { id: number | null; name: string | null; price: number | null; quantity: number | null }[];
};
