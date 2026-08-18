import { describe, it, expect, vi, afterEach } from "vitest";

// Set env before any module loads
process.env.DELLIN_API_KEY = "test-api-key";

// Stub fetch globally before importing tool modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { calculateSchema, handleCalculate } from "../src/tools/calculate.js";
import { getCitiesSchema, handleGetCities } from "../src/tools/cities.js";
import { trackSchema, handleTrack } from "../src/tools/tracking.js";
import { getTerminalsSchema, handleGetTerminals } from "../src/tools/terminals.js";
import { createOrderSchema, handleCreateOrder } from "../src/tools/order.js";
import { getOrderHistorySchema, handleGetOrderHistory } from "../src/tools/order-history.js";

// BaseHttpClient из ядра читает тело через response.text() и парсит JSON сам.
function mockApiResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

describe("calculate tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    const result = calculateSchema.safeParse({
      derival_city_id: 1,
      arrival_city_id: 2,
      weight: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid weight", () => {
    const result = calculateSchema.safeParse({
      derival_city_id: 1,
      arrival_city_id: 2,
      weight: -5,
    });
    expect(result.success).toBe(false);
  });

  it("handles successful calculation", async () => {
    mockApiResponse({
      data: {
        price: 1500,
        intercity: { price: 1500, delivery_time_from: 3, delivery_time_to: 5 },
      },
    });

    const result = await handleCalculate({ derival_city_id: 1, arrival_city_id: 2, weight: 10, quantity: 1 });
    const parsed = JSON.parse(result);
    expect(parsed.общая_стоимость).toBe(1500);
    expect(parsed.варианты).toHaveLength(1);
    expect(parsed.варианты[0].тип).toBe("Межгород (автодоставка)");
  });

  it("handles no data response", async () => {
    mockApiResponse({});
    const result = await handleCalculate({ derival_city_id: 1, arrival_city_id: 2, weight: 10, quantity: 1 });
    expect(result).toContain("Не удалось рассчитать");
  });
});

describe("get_cities tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    expect(getCitiesSchema.safeParse({ query: "Москва" }).success).toBe(true);
    expect(getCitiesSchema.safeParse({}).success).toBe(false);
  });

  it("returns cities", async () => {
    mockApiResponse({
      cities: [{ cityID: 1, name: "Москва", code: "MSK", region: "Московская обл." }],
    });

    const result = await handleGetCities({ query: "Москва" });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].название).toBe("Москва");
  });

  it("handles empty result", async () => {
    mockApiResponse({ cities: [] });
    const result = await handleGetCities({ query: "НесуществующийГород" });
    expect(result).toContain("не найдены");
  });
});

describe("track tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    expect(trackSchema.safeParse({ doc_id: "123456" }).success).toBe(true);
  });

  it("returns tracking info", async () => {
    mockApiResponse({
      data: [
        {
          orderNumber: "123456",
          orderId: "abc",
          state: "delivered",
          stateName: "Доставлен",
          orderDate: "2025-01-01",
          senderCity: "Москва",
          receiverCity: "Санкт-Петербург",
        },
      ],
    });

    const result = await handleTrack({ doc_id: "123456" });
    const parsed = JSON.parse(result);
    expect(parsed.статус).toBe("Доставлен");
    expect(parsed.город_отправления).toBe("Москва");
  });

  it("handles not found", async () => {
    mockApiResponse({ data: [] });
    const result = await handleTrack({ doc_id: "000" });
    expect(result).toContain("не найден");
  });
});

describe("get_terminals tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    expect(getTerminalsSchema.safeParse({ city_id: 1 }).success).toBe(true);
  });

  it("returns terminals", async () => {
    mockApiResponse({
      terminals: [
        { id: 10, name: "Терминал Москва-1", address: "ул. Ленина 1", cityID: 1, workingHours: "9:00-18:00" },
      ],
    });

    const result = await handleGetTerminals({ city_id: 1 });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].название).toBe("Терминал Москва-1");
  });

  it("handles empty terminals", async () => {
    mockApiResponse({ terminals: [] });
    const result = await handleGetTerminals({ city_id: 999 });
    expect(result).toContain("не найдены");
  });
});

describe("create_order tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    const result = createOrderSchema.safeParse({
      sender_city_id: 1,
      receiver_city_id: 2,
      cargo_weight: 10,
      sender_name: "Иванов",
      sender_phone: "+79001234567",
      receiver_name: "Петров",
      receiver_phone: "+79007654321",
    });
    expect(result.success).toBe(true);
  });

  it("creates order", async () => {
    mockApiResponse({
      data: { orderNumber: "DL-123", orderId: "abc", state: "created" },
    });

    const result = await handleCreateOrder({
      sender_city_id: 1,
      receiver_city_id: 2,
      cargo_weight: 10,
      cargo_quantity: 1,
      sender_name: "Иванов",
      sender_phone: "+79001234567",
      receiver_name: "Петров",
      receiver_phone: "+79007654321",
    });
    const parsed = JSON.parse(result);
    expect(parsed.номер_заказа).toBe("DL-123");
  });
});

describe("get_order_history tool", () => {
  afterEach(() => vi.clearAllMocks());

  it("validates schema", () => {
    expect(getOrderHistorySchema.safeParse({}).success).toBe(true);
    expect(getOrderHistorySchema.safeParse({ date_from: "2025-01-01" }).success).toBe(true);
  });

  it("returns order history", async () => {
    mockApiResponse({
      data: [
        {
          orderNumber: "DL-1",
          orderId: "a",
          state: "done",
          stateName: "Выполнен",
          orderDate: "2025-01-01",
          senderCity: "Москва",
          receiverCity: "Казань",
        },
      ],
      metadata: { total: 1, page: 1, pages: 1 },
    });

    const result = await handleGetOrderHistory({ page: 1 });
    const parsed = JSON.parse(result);
    expect(parsed.заказы).toHaveLength(1);
    expect(parsed.всего).toBe(1);
  });

  it("handles empty history", async () => {
    mockApiResponse({ data: [] });
    const result = await handleGetOrderHistory({ page: 1 });
    expect(result).toContain("не найдены");
  });
});
