import type {
  RawOrder, RawCustomer, RawProduct,
  OrderSummary, OrderView, CustomerSummary, CustomerView, ProductView,
  PaginationView,
} from "../types.js";

// ── Tool result contract ─────────────────────────────────────
// Handlers return a ToolResult; src/index.ts maps it to an MCP tool result.
// Keeping data in `text` (compact JSON) works with every MCP client today;
// `structured` mirrors it for forward-compatible clients that read structuredContent.

export type Detail = "summary" | "full";

export type ToolResult = { text: string; structured?: unknown; isError?: boolean };

export function jsonText(v: unknown): string {
  return JSON.stringify(v);
}

/** Success carrying a shaped object (serialized compactly into text). */
export function ok(structured: unknown): ToolResult {
  return { text: jsonText(structured), structured };
}

/** Success carrying a custom text message plus optional structured payload. */
export function okText(text: string, structured?: unknown): ToolResult {
  return { text, structured };
}

/** Handled failure surfaced to the model (isError:true) so it can self-correct. */
export function fail(message: string): ToolResult {
  return { text: message, isError: true };
}

/** Wrap a handler so thrown API errors become isError results instead of protocol errors. */
export async function runTool(fn: () => Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await fn();
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}

// ── Small helpers ────────────────────────────────────────────

export function firstPhone(phones?: { number?: string }[]): string | null {
  return phones?.find(p => p?.number)?.number ?? null;
}

export function joinName(...parts: (string | undefined | null)[]): string | null {
  const s = parts.filter(Boolean).join(" ").trim();
  return s || null;
}

/** Reference endpoints return objects keyed by code; flatten to an array of values. */
export function valuesOf(map: unknown): unknown[] {
  if (Array.isArray(map)) return map;
  if (map && typeof map === "object") return Object.values(map as Record<string, unknown>);
  return [];
}

export function paginationOf(resp: unknown, returned: number): PaginationView | null {
  const p = (resp as { pagination?: Partial<PaginationView> & { currentPage?: number; totalPageCount?: number; totalCount?: number } })?.pagination;
  if (!p) return null;
  const page = p.currentPage ?? 1;
  const totalPages = p.totalPageCount ?? 1;
  return {
    page,
    totalPages,
    totalCount: p.totalCount ?? returned,
    returned,
    hasMore: page < totalPages,
  };
}

// ── Order mappers ────────────────────────────────────────────

export function toOrderSummary(o: RawOrder): OrderSummary {
  const customerName = o.customer
    ? joinName(o.customer.firstName, o.customer.patronymic, o.customer.lastName)
    : joinName(o.firstName, o.lastName);
  return {
    id: o.id,
    number: o.number ?? null,
    status: o.status ?? null,
    total: o.totalSumm ?? null,
    customer: customerName,
    phone: firstPhone(o.customer?.phones) ?? o.phone ?? null,
    itemCount: o.items?.length ?? 0,
    createdAt: o.createdAt ?? null,
  };
}

export function toOrderView(o: RawOrder): OrderView {
  return {
    ...toOrderSummary(o),
    externalId: o.externalId ?? null,
    orderType: o.orderType ?? null,
    orderMethod: o.orderMethod ?? null,
    email: o.customer?.email ?? o.email ?? null,
    statusComment: o.statusComment ?? null,
    statusUpdatedAt: o.statusUpdatedAt ?? null,
    managerComment: o.managerComment ?? null,
    customerComment: o.customerComment ?? null,
    items: (o.items ?? []).map(it => {
      const initialPrice = it.initialPrice ?? 0;
      return {
        name: it.offer?.displayName ?? it.offer?.name ?? it.productName ?? "—",
        quantity: it.quantity ?? 0,
        initialPrice,
        discountTotal: it.discountTotal ?? 0,
        // Effective unit price after discounts (prices[] is post-discount per tranche).
        price: it.prices?.[0]?.price ?? initialPrice,
      };
    }),
    delivery: o.delivery
      ? { code: o.delivery.code ?? null, cost: o.delivery.cost ?? null, address: o.delivery.address?.text ?? null }
      : null,
    payments: Object.values(o.payments ?? {}).map(p => ({
      type: p.type ?? null,
      amount: p.amount ?? null,
      status: p.status ?? null,
    })),
  };
}

// ── Customer mappers ─────────────────────────────────────────

export function toCustomerSummary(c: RawCustomer): CustomerSummary {
  return {
    id: c.id,
    name: joinName(c.firstName, c.patronymic, c.lastName),
    email: c.email ?? null,
    phone: firstPhone(c.phones),
    ordersCount: c.ordersCount ?? null,
    totalSpent: c.totalSumm ?? null,
  };
}

export function toCustomerView(c: RawCustomer): CustomerView {
  return {
    ...toCustomerSummary(c),
    externalId: c.externalId ?? null,
    patronymic: c.patronymic ?? null,
    phones: (c.phones ?? []).map(p => p.number).filter((n): n is string => Boolean(n)),
    address: c.address?.text ?? null,
    city: c.address?.city ?? null,
    region: c.address?.region ?? null,
    createdAt: c.createdAt ?? null,
  };
}

// ── Product mapper ───────────────────────────────────────────

export function toProductView(p: RawProduct): ProductView {
  return {
    id: p.id,
    name: p.name ?? null,
    article: p.article ?? null,
    active: p.active ?? false,
    url: p.url ?? null,
    groups: (p.groups ?? []).map(g => g.name).filter((n): n is string => Boolean(n)),
    offers: (p.offers ?? []).map(o => ({
      id: o.id ?? null,
      name: o.name ?? null,
      price: o.price ?? null,
      quantity: o.quantity ?? null,
    })),
  };
}

// ── List presenters (raw response → shaped + pagination) ─────

export function presentOrderList(resp: unknown, detail: Detail): { pagination: PaginationView | null; orders: (OrderSummary | OrderView)[] } {
  const raw = (resp as { orders?: RawOrder[] })?.orders ?? [];
  const orders = raw.map(o => (detail === "full" ? toOrderView(o) : toOrderSummary(o)));
  return { pagination: paginationOf(resp, orders.length), orders };
}

export function presentCustomerList(resp: unknown, detail: Detail): { pagination: PaginationView | null; customers: (CustomerSummary | CustomerView)[] } {
  const raw = (resp as { customers?: RawCustomer[] })?.customers ?? [];
  const customers = raw.map(c => (detail === "full" ? toCustomerView(c) : toCustomerSummary(c)));
  return { pagination: paginationOf(resp, customers.length), customers };
}

export function presentProductList(resp: unknown): { pagination: PaginationView | null; products: ProductView[] } {
  const raw = (resp as { products?: RawProduct[] })?.products ?? [];
  const products = raw.map(toProductView);
  return { pagination: paginationOf(resp, products.length), products };
}
