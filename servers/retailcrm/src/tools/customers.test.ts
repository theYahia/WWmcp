import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleListCustomers, handleGetCustomer, handleCreateCustomer,
  handleUpdateCustomer, handleMergeCustomers,
} from "./customers.js";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(data), { status }),
  );
}

const customerBody = (spy: ReturnType<typeof vi.spyOn>) => {
  const body = (spy.mock.calls[0][1] as RequestInit).body as string;
  return JSON.parse(decodeURIComponent(body).match(/customer=(.+?)(&|$)/)![1]);
};

describe("handleListCustomers", () => {
  it("sends correct filter params and shapes a summary", async () => {
    const spy = mockFetch({
      success: true,
      customers: [{ id: 5, firstName: "Ivan", lastName: "Petrov", email: "i@mail.ru", ordersCount: 3, totalSumm: 9000 }],
      pagination: { currentPage: 1, totalPageCount: 1, totalCount: 1 },
    });
    const result = await handleListCustomers({ filter_email: "test@mail.ru", detail: "summary", page: 1, limit: 10 });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5Bemail%5D=test%40mail.ru");
    const parsed = JSON.parse(result.text);
    expect(parsed.customers[0]).toMatchObject({ id: 5, name: "Ivan Petrov", ordersCount: 3, totalSpent: 9000 });
  });

  it("uses the customers-endpoint date filter keys (dateFrom/dateTo, not createdAt*)", async () => {
    const spy = mockFetch({ success: true, customers: [], pagination: { totalCount: 0 } });
    await handleListCustomers({ filter_date_from: "2025-01-01", filter_date_to: "2025-01-31", detail: "summary", page: 1, limit: 20 });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5BdateFrom%5D=2025-01-01");
    expect(url).toContain("filter%5BdateTo%5D=2025-01-31");
    expect(url).not.toContain("createdAtFrom");
  });
});

describe("handleGetCustomer", () => {
  it("fetches and shapes a customer by id", async () => {
    const spy = mockFetch({ success: true, customer: { id: 5, firstName: "Ivan" } });
    const result = await handleGetCustomer({ id: "5", by: "id", detail: "summary" });
    expect(spy.mock.calls[0][0]).toContain("/customers/5");
    expect(JSON.parse(result.text).customer.name).toBe("Ivan");
  });
});

describe("handleCreateCustomer", () => {
  it("sends customer with phones and address", async () => {
    const spy = mockFetch({ success: true, id: 10 });
    await handleCreateCustomer({
      first_name: "Anna", last_name: "Ivanova", email: "anna@mail.ru",
      phones: ["+79001111111", "+79002222222"], address_city: "Moscow",
    });
    const customer = customerBody(spy);
    expect(customer.firstName).toBe("Anna");
    expect(customer.phones).toHaveLength(2);
    expect(customer.address.city).toBe("Moscow");
  });
});

describe("handleUpdateCustomer", () => {
  it("edits a customer by externalId", async () => {
    const spy = mockFetch({ success: true });
    await handleUpdateCustomer({ id: "EXT-9", by: "externalId", email: "new@mail.ru" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/customers/EXT-9/edit");
    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain("by=externalId");
    expect(customerBody(spy).email).toBe("new@mail.ru");
  });
});

describe("handleMergeCustomers", () => {
  it("sends merge request with correct body", async () => {
    const spy = mockFetch({ success: true });
    await handleMergeCustomers({ result_customer_id: 1, merged_customer_ids: [2, 3] });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/customers/combine");
    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain("resultCustomer=");
    expect(body).toContain("mergedCustomers=");
  });
});
