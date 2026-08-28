import { describe, it, expect } from "vitest";
import {
  toOrderSummary, toOrderView, toCustomerSummary, toCustomerView,
  toProductView, paginationOf, presentOrderList, firstPhone, joinName, valuesOf,
} from "./index.js";
import type { RawOrder, RawCustomer, RawProduct } from "../types.js";

const rawOrder: RawOrder = {
  id: 1,
  number: "1001",
  status: "new",
  orderType: "eshop-individual",
  totalSumm: 1500,
  createdAt: "2025-01-01 10:00:00",
  customer: { id: 9, firstName: "Ivan", lastName: "Petrov", email: "i@mail.ru", phones: [{ number: "+79001234567" }] },
  items: [{ offer: { displayName: "Widget" }, quantity: 2, initialPrice: 750 }],
  delivery: { code: "courier", cost: 300, address: { text: "Moscow, Lenina 1" } },
  payments: { "1": { type: "cash", amount: 1500, status: "paid" } },
  managerComment: "VIP",
};

describe("order mappers", () => {
  it("summary keeps only essential fields", () => {
    const s = toOrderSummary(rawOrder);
    expect(s).toEqual({
      id: 1, number: "1001", status: "new", total: 1500,
      customer: "Ivan Petrov", phone: "+79001234567", itemCount: 1, createdAt: "2025-01-01 10:00:00",
    });
    // No heavy nesting leaks into summary
    expect((s as Record<string, unknown>).items).toBeUndefined();
    expect((s as Record<string, unknown>).delivery).toBeUndefined();
  });

  it("full view includes items, delivery, payments", () => {
    const v = toOrderView(rawOrder);
    expect(v.items).toEqual([{ name: "Widget", quantity: 2, initialPrice: 750, discountTotal: 0, price: 750 }]);
    expect(v.delivery).toEqual({ code: "courier", cost: 300, address: "Moscow, Lenina 1" });
    expect(v.payments).toEqual([{ type: "cash", amount: 1500, status: "paid" }]);
    expect(v.managerComment).toBe("VIP");
  });

  it("surfaces effective price + discount for discounted items", () => {
    const discounted: RawOrder = {
      id: 2,
      items: [{ offer: { displayName: "Sale" }, quantity: 1, initialPrice: 1000, discountTotal: 300, prices: [{ price: 700, quantity: 1 }] }],
    };
    const v = toOrderView(discounted);
    expect(v.items[0]).toEqual({ name: "Sale", quantity: 1, initialPrice: 1000, discountTotal: 300, price: 700 });
  });

  it("is much smaller than the raw payload", () => {
    const rawSize = JSON.stringify(rawOrder).length;
    const summarySize = JSON.stringify(toOrderSummary(rawOrder)).length;
    expect(summarySize).toBeLessThan(rawSize);
  });
});

describe("customer mappers", () => {
  const c: RawCustomer = {
    id: 5, firstName: "Anna", lastName: "Smirnova", email: "a@mail.ru",
    phones: [{ number: "+700001" }, { number: "+700002" }],
    address: { text: "SPb", city: "Saint Petersburg", region: "SPb" },
    ordersCount: 4, totalSumm: 12000, createdAt: "2024-06-01",
  };
  it("summary", () => {
    expect(toCustomerSummary(c)).toEqual({
      id: 5, name: "Anna Smirnova", email: "a@mail.ru", phone: "+700001", ordersCount: 4, totalSpent: 12000,
    });
  });
  it("full includes all phones + address", () => {
    const v = toCustomerView(c);
    expect(v.phones).toEqual(["+700001", "+700002"]);
    expect(v.city).toBe("Saint Petersburg");
  });
});

describe("product mapper", () => {
  it("flattens groups and offers", () => {
    const p: RawProduct = {
      id: 3, name: "Phone", article: "A1", active: true,
      groups: [{ id: 1, name: "Electronics" }],
      offers: [{ id: 11, name: "Black", price: 999, quantity: 7 }],
    };
    expect(toProductView(p)).toEqual({
      id: 3, name: "Phone", article: "A1", active: true, url: null,
      groups: ["Electronics"],
      offers: [{ id: 11, name: "Black", price: 999, quantity: 7 }],
    });
  });
});

describe("helpers", () => {
  it("paginationOf computes hasMore", () => {
    const p = paginationOf({ pagination: { currentPage: 1, totalPageCount: 4, totalCount: 73 } }, 20);
    expect(p).toEqual({ page: 1, totalPages: 4, totalCount: 73, returned: 20, hasMore: true });
  });
  it("paginationOf returns null without pagination", () => {
    expect(paginationOf({}, 0)).toBeNull();
  });
  it("presentOrderList shapes orders + pagination", () => {
    const out = presentOrderList({ orders: [rawOrder], pagination: { currentPage: 1, totalPageCount: 1, totalCount: 1 } }, "summary");
    expect(out.orders).toHaveLength(1);
    expect(out.pagination?.hasMore).toBe(false);
  });
  it("firstPhone / joinName / valuesOf", () => {
    expect(firstPhone([{ number: "" }, { number: "+7" }])).toBe("+7");
    expect(firstPhone(undefined)).toBeNull();
    expect(joinName("Ivan", undefined, "Petrov")).toBe("Ivan Petrov");
    expect(joinName()).toBeNull();
    expect(valuesOf({ a: 1, b: 2 })).toEqual([1, 2]);
    expect(valuesOf([1, 2])).toEqual([1, 2]);
  });
});
