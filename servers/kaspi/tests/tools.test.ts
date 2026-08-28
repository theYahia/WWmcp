import { describe, it, expect, vi, afterEach } from "vitest";

// Set the key before the client is built (it is read lazily, on first request).
process.env["KASPI_API_KEY"] = "test-api-key";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { getOrdersSchema, handleGetOrders } from "../src/tools/orders.js";
import { getProductsSchema, handleGetProducts } from "../src/tools/products.js";
import { getOrderSchema, handleGetOrder } from "../src/tools/order.js";

// core's BaseHttpClient reads the body via response.text() and parses JSON itself.
function mockApiResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
}

function calledUrl(): string {
  return mockFetch.mock.calls[0][0] as string;
}

const orderFixture = {
  id: "ord_1",
  type: "orders",
  attributes: {
    code: "123-456",
    totalPrice: 15000,
    paymentMode: "PAY_WITH_CREDIT",
    deliveryMode: "DELIVERY_PICKUP",
    creationDate: "2026-03-01T10:00:00Z",
    state: "NEW",
    status: "APPROVED_BY_BANK",
    isKaspiDelivery: true,
    deliveryCostForSeller: 500,
    signatureRequired: false,
    customer: { id: "c1", name: "Иван Иванов", cellPhone: "+77001234567" },
    deliveryAddress: {
      formattedAddress: "Алматы, ул. Абая 1",
      latitude: 43.2,
      longitude: 76.9,
    },
  },
};

afterEach(() => vi.clearAllMocks());

describe("get_orders", () => {
  it("validates the schema and applies page defaults", () => {
    const parsed = getOrdersSchema.parse({});
    expect(parsed.page_number).toBe(0);
    expect(parsed.page_size).toBe(20);
  });

  it("rejects a page_size above 100", () => {
    expect(getOrdersSchema.safeParse({ page_size: 101 }).success).toBe(false);
  });

  it("rejects an unknown state", () => {
    expect(getOrdersSchema.safeParse({ state: "SHIPPED" }).success).toBe(false);
  });

  it("sends paging, the state filter, and dates as epoch millis", async () => {
    mockApiResponse({ data: [] });
    await handleGetOrders({
      page_number: 1,
      page_size: 50,
      state: "NEW",
      creation_date_from: "2026-03-01",
    });

    const url = calledUrl();
    expect(url).toContain("/orders?");
    expect(url).toContain("page%5Bnumber%5D=1");
    expect(url).toContain("page%5Bsize%5D=50");
    expect(url).toContain("filter%5Borders%5D%5Bstate%5D=NEW");
    expect(url).toContain(
      `%24ge%5D=${new Date("2026-03-01").getTime()}`,
    );
  });

  it("returns a Russian empty-result message", async () => {
    mockApiResponse({ data: [] });
    const result = await handleGetOrders({ page_number: 0, page_size: 20 });
    expect(result).toBe("Заказы не найдены.");
  });

  it("maps orders to Russian-keyed JSON", async () => {
    mockApiResponse({ data: [orderFixture] });
    const parsed = JSON.parse(
      await handleGetOrders({ page_number: 0, page_size: 20 }),
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      id: "ord_1",
      код: "123-456",
      сумма: 15000,
      состояние: "NEW",
      адрес: "Алматы, ул. Абая 1",
    });
    expect(parsed[0].клиент.телефон).toBe("+77001234567");
  });
});

describe("get_order", () => {
  it("requires an id", () => {
    expect(getOrderSchema.safeParse({}).success).toBe(false);
  });

  it("URL-encodes the id so it cannot escape the /orders/ path", async () => {
    mockApiResponse({ data: orderFixture });
    await handleGetOrder({ id: "../merchantoffers" });
    expect(calledUrl()).toBe(
      "https://kaspi.kz/shop/api/v2/orders/..%2Fmerchantoffers",
    );
  });

  it("returns delivery detail fields", async () => {
    mockApiResponse({ data: orderFixture });
    const parsed = JSON.parse(await handleGetOrder({ id: "ord_1" }));
    expect(parsed.kaspi_доставка).toBe(true);
    expect(parsed.стоимость_доставки).toBe(500);
    expect(parsed.адрес.широта).toBe(43.2);
  });

  it("reports a missing order by id", async () => {
    mockApiResponse({ data: null });
    const result = await handleGetOrder({ id: "ord_404" });
    expect(result).toBe("Заказ ord_404 не найден.");
  });
});

describe("get_products", () => {
  it("omits the isActive filter when not given", async () => {
    mockApiResponse({ data: [] });
    await handleGetProducts({ page_number: 0, page_size: 20 });
    expect(calledUrl()).not.toContain("isActive");
  });

  it("sends the isActive filter when false", async () => {
    mockApiResponse({ data: [] });
    await handleGetProducts({ page_number: 0, page_size: 20, is_active: false });
    expect(calledUrl()).toContain(
      "filter%5BmerchantOffers%5D%5BisActive%5D=false",
    );
  });

  it("hits /merchantoffers and maps products", async () => {
    mockApiResponse({
      data: [
        {
          id: "p1",
          type: "merchantoffers",
          attributes: {
            masterProduct: { sku: "SKU1", name: "Чайник", manufacturer: "Bosch" },
            sku: "SKU1",
            price: 9990,
            isActive: true,
            availabilityStatus: "AVAILABLE",
          },
        },
      ],
    });
    const parsed = JSON.parse(
      await handleGetProducts({ page_number: 0, page_size: 20 }),
    );
    expect(calledUrl()).toContain("/merchantoffers");
    expect(parsed[0]).toMatchObject({
      sku: "SKU1",
      название: "Чайник",
      производитель: "Bosch",
      цена: 9990,
      активен: true,
    });
  });

  it("returns a Russian empty-result message", async () => {
    mockApiResponse({ data: [] });
    const result = await handleGetProducts({ page_number: 0, page_size: 20 });
    expect(result).toBe("Товары не найдены.");
  });

  it("validates page bounds", () => {
    expect(getProductsSchema.safeParse({ page_number: -1 }).success).toBe(false);
  });
});
