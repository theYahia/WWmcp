import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the client before importing tools
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("../src/client.js", () => ({
  getClient: () => ({
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  }),
}));

import { handleCalculateTariff, handleCalculateTariffList } from "../src/tools/calculate.js";
import { handleGetCities, handleGetRegions, handleListDeliveryPoints } from "../src/tools/locations.js";
import { handleCreateOrder, handleGetOrder, handleDeleteOrder } from "../src/tools/orders.js";
import { handleTrackShipment } from "../src/tools/tracking.js";
import { handleGenerateBarcode } from "../src/tools/barcode.js";
import { handleCreateIntake, handleGetIntake } from "../src/tools/intake.js";
import { handlePrintReceipt } from "../src/tools/print.js";
import { handleCreateWebhook } from "../src/tools/webhooks.js";

describe("calculate_tariff", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns formatted tariff result", async () => {
    mockPost.mockResolvedValueOnce({
      delivery_sum: 450,
      period_min: 2,
      period_max: 4,
      weight_calc: 1500,
      currency: "RUB",
    });

    const result = await handleCalculateTariff({
      from_location: { code: 44 },
      to_location: { code: 137 },
      tariff_code: 136,
      packages: [{ weight: 1500 }],
    });

    const parsed = JSON.parse(result);
    expect(parsed.стоимость_доставки).toBe(450);
    expect(parsed.срок_мин_дней).toBe(2);
    expect(mockPost).toHaveBeenCalledWith("/calculator/tariff", expect.any(Object));
  });

  it("returns error when API responds with errors", async () => {
    mockPost.mockResolvedValueOnce({
      errors: [{ code: "v2_invalid_tariff", message: "Тариф не найден" }],
    });

    const result = await handleCalculateTariff({
      from_location: { code: 44 },
      to_location: { code: 137 },
      tariff_code: 999,
      packages: [{ weight: 1000 }],
    });

    expect(result).toContain("Ошибка расчёта");
    expect(result).toContain("v2_invalid_tariff");
  });
});

describe("create_order", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns order UUID on success", async () => {
    mockPost.mockResolvedValueOnce({
      entity: { uuid: "order-uuid-123", cdek_number: "1234567890" },
      requests: [{ request_uuid: "req-1", type: "CREATE", state: "ACCEPTED" }],
    });

    const result = await handleCreateOrder({
      tariff_code: 136,
      from_location: { code: 44 },
      to_location: { code: 137 },
      recipient: { name: "Иванов Иван", phones: [{ number: "+79001234567" }] },
      packages: [{ number: "1", weight: 1500 }],
    });

    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("order-uuid-123");
    expect(parsed.статус_запроса).toBe("ACCEPTED");
  });
});

describe("get_order", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns order info", async () => {
    mockGet.mockResolvedValueOnce({
      entity: {
        uuid: "order-uuid-123",
        cdek_number: "1234567890",
        statuses: [
          { code: "CREATED", name: "Создан", date_time: "2025-01-01T00:00:00Z", city: "Москва" },
        ],
      },
    });

    const result = await handleGetOrder({ uuid: "order-uuid-123" });
    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("order-uuid-123");
    expect(parsed.статусы).toHaveLength(1);
  });
});

describe("track_shipment", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns tracking info", async () => {
    mockGet.mockResolvedValueOnce({
      entity: {
        uuid: "uuid-1",
        cdek_number: "1234567890",
        statuses: [
          { code: "DELIVERED", name: "Вручен", date_time: "2025-01-05T12:00:00Z", city: "СПб" },
          { code: "CREATED", name: "Создан", date_time: "2025-01-01T00:00:00Z", city: "Москва" },
        ],
      },
    });

    const result = await handleTrackShipment({ cdek_number: "1234567890" });
    const parsed = JSON.parse(result);
    expect(parsed.номер).toBe("1234567890");
    expect(parsed.последний_статус.код).toBe("DELIVERED");
    expect(parsed.все_статусы).toHaveLength(2);
  });

  it("handles not found", async () => {
    mockGet.mockResolvedValueOnce({ entity: null });

    const result = await handleTrackShipment({ cdek_number: "0000000000" });
    expect(result).toContain("не найдено");
  });
});

describe("get_cities", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns city list", async () => {
    mockGet.mockResolvedValueOnce([
      { code: 44, city: "Москва", region: "Московская", country_code: "RU" },
    ]);

    const result = await handleGetCities({ city: "Москва", size: 50, page: 0 });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].город).toBe("Москва");
  });

  it("handles empty results", async () => {
    mockGet.mockResolvedValueOnce([]);
    const result = await handleGetCities({ city: "НесуществующийГород", size: 50, page: 0 });
    expect(result).toContain("не найдены");
  });
});

describe("list_delivery_points", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns delivery points", async () => {
    mockGet.mockResolvedValueOnce([
      {
        code: "MSK-001",
        name: "ПВЗ Москва-1",
        type: "PVZ",
        location: { city: "Москва", address: "ул. Тверская, 1", country_code: "RU", region_code: 77, city_code: 44, longitude: 37.6, latitude: 55.7 },
        owner_code: "cdek",
        work_time: "09:00-21:00",
        is_dressing_room: true,
        have_cash: true,
        have_cashless: true,
      },
    ]);

    const result = await handleListDeliveryPoints({ city_code: 44, type: "ALL", country_code: "RU", size: 50, page: 0 });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].код).toBe("MSK-001");
  });
});

describe("generate_barcode", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns barcode request status", async () => {
    mockPost.mockResolvedValueOnce({
      entity: { uuid: "order-uuid-123" },
      requests: [{ request_uuid: "req-bar", type: "CREATE", state: "ACCEPTED" }],
    });

    const result = await handleGenerateBarcode({ uuid: "order-uuid-123", copy_count: 1, format: "A4" });
    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("order-uuid-123");
    expect(parsed.статус_запроса).toBe("ACCEPTED");
    expect(mockPost).toHaveBeenCalledWith("/orders/order-uuid-123/barcode", { copy_count: 1, format: "A4" });
  });
});

describe("delete_order", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns deletion confirmation", async () => {
    mockDelete.mockResolvedValueOnce({
      entity: { uuid: "order-uuid-123" },
      requests: [{ request_uuid: "req-del", type: "DELETE", state: "ACCEPTED" }],
    });

    const result = await handleDeleteOrder({ uuid: "order-uuid-123" });
    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("order-uuid-123");
    expect(parsed.сообщение).toBe("Заказ удалён.");
    expect(mockDelete).toHaveBeenCalledWith("/orders/order-uuid-123");
  });
});

describe("calculate_tariff_list", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns multiple tariffs", async () => {
    mockPost.mockResolvedValueOnce({
      tariff_codes: [
        { tariff_code: 136, tariff_name: "Посылка склад-склад", delivery_sum: 300, period_min: 2, period_max: 4, delivery_mode: 2 },
        { tariff_code: 137, tariff_name: "Посылка склад-дверь", delivery_sum: 450, period_min: 3, period_max: 5, delivery_mode: 3 },
      ],
    });

    const result = await handleCalculateTariffList({
      from_location: { code: 44 },
      to_location: { code: 137 },
      packages: [{ weight: 1500 }],
    });

    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].код_тарифа).toBe(136);
    expect(parsed[1].стоимость).toBe(450);
  });

  it("handles empty tariff list", async () => {
    mockPost.mockResolvedValueOnce({ tariff_codes: [] });

    const result = await handleCalculateTariffList({
      from_location: { code: 44 },
      to_location: { code: 999 },
      packages: [{ weight: 1500 }],
    });

    expect(result).toContain("Нет доступных тарифов");
  });

  it("handles API errors", async () => {
    mockPost.mockResolvedValueOnce({
      errors: [{ code: "v2_error", message: "Bad request" }],
    });

    const result = await handleCalculateTariffList({
      from_location: { code: 44 },
      to_location: { code: 137 },
      packages: [{ weight: 1500 }],
    });

    expect(result).toContain("Ошибка расчёта");
  });
});

describe("get_regions", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns region list", async () => {
    mockGet.mockResolvedValueOnce([
      { region: "Московская область", region_code: 77, country_code: "RU", country: "Россия" },
    ]);

    const result = await handleGetRegions({ country_codes: "RU", size: 50, page: 0 });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].регион).toBe("Московская область");
  });

  it("handles empty results", async () => {
    mockGet.mockResolvedValueOnce([]);
    const result = await handleGetRegions({ size: 50, page: 0 });
    expect(result).toContain("не найдены");
  });
});

describe("list_delivery_points with GPS", () => {
  afterEach(() => vi.clearAllMocks());

  const near = {
    code: "MSK-near",
    name: "ПВЗ рядом",
    type: "PVZ",
    location: { city: "Москва", address: "ул. Тверская, 1", country_code: "RU", region_code: 77, city_code: 44, longitude: 37.6210, latitude: 55.7540 },
    owner_code: "cdek",
    work_time: "10:00-20:00",
    is_dressing_room: true,
    have_cash: true,
    have_cashless: true,
  };
  const far = {
    code: "MSK-far",
    name: "ПВЗ далеко",
    type: "PVZ",
    location: { city: "Москва", address: "МКАД, 50", country_code: "RU", region_code: 77, city_code: 44, longitude: 37.9, latitude: 55.5 },
    owner_code: "cdek",
    work_time: "10:00-20:00",
    is_dressing_room: false,
    have_cash: true,
    have_cashless: true,
  };

  it("filters by radius, sorts by distance, and never forwards geo params to CDEK", async () => {
    mockGet.mockResolvedValueOnce([far, near]); // intentionally unsorted

    const result = await handleListDeliveryPoints({
      city_code: 44,
      latitude: 55.7539,
      longitude: 37.6208,
      radius_km: 5,
      type: "ALL",
      country_code: "RU",
      size: 50,
      page: 0,
    });

    const parsed = JSON.parse(result);
    // Only the nearby point is within 5 km; the far one (~30 km) is filtered out.
    expect(parsed).toHaveLength(1);
    expect(parsed[0].код).toBe("MSK-near");
    expect(parsed[0].координаты.широта).toBe(55.7540);
    expect(typeof parsed[0].расстояние_км).toBe("number");

    // Geo filtering is client-side: lat/lng/radius must NOT reach the CDEK query.
    const [path, query] = mockGet.mock.calls[0];
    expect(path).toBe("/deliverypoints");
    expect(query).not.toHaveProperty("latitude");
    expect(query).not.toHaveProperty("longitude");
    expect(query).not.toHaveProperty("radius");
    expect(query).not.toHaveProperty("radius_km");
    expect(query.city_code).toBe("44");
  });

  it("rejects partial geo params (needs all three)", async () => {
    await expect(
      handleListDeliveryPoints({
        city_code: 44,
        latitude: 55.7539,
        type: "ALL",
        country_code: "RU",
        size: 50,
        page: 0,
      }),
    ).rejects.toThrow(/гео-поиск/);
  });
});

describe("create_courier_pickup", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns intake uuid and status", async () => {
    mockPost.mockResolvedValueOnce({
      entity: {
        uuid: "intake-uuid-1",
        order_uuid: "order-uuid-1",
        intake_date: "2025-02-01",
        intake_time_from: "10:00",
        intake_time_to: "14:00",
      },
      requests: [{ request_uuid: "req-3", type: "CREATE", state: "ACCEPTED" }],
    });

    const result = await handleCreateIntake({
      order_uuid: "order-uuid-1",
      intake_date: "2025-02-01",
      intake_time_from: "10:00",
      intake_time_to: "14:00",
    });

    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("intake-uuid-1");
    expect(parsed.дата_забора).toBe("2025-02-01");
    expect(parsed.статус_запроса).toBe("ACCEPTED");
  });

  it("handles API errors", async () => {
    mockPost.mockResolvedValueOnce({
      errors: [{ code: "v2_intake_error", message: "Order not found" }],
    });

    const result = await handleCreateIntake({
      order_uuid: "bad-uuid",
      intake_date: "2025-02-01",
      intake_time_from: "10:00",
      intake_time_to: "14:00",
    });

    expect(result).toContain("Ошибка создания заявки");
  });
});

describe("get_courier_pickup", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns intake details", async () => {
    mockGet.mockResolvedValueOnce({
      entity: {
        uuid: "intake-uuid-1",
        order_uuid: "order-uuid-1",
        cdek_number: "INT-123",
        intake_date: "2025-02-01",
        intake_time_from: "10:00",
        intake_time_to: "14:00",
        statuses: [{ code: "ACCEPTED", name: "Принята", date_time: "2025-01-31T12:00:00Z" }],
      },
    });

    const result = await handleGetIntake({ uuid: "intake-uuid-1" });
    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("intake-uuid-1");
    expect(parsed.номер_сдэк).toBe("INT-123");
    expect(parsed.статусы).toHaveLength(1);
  });
});

describe("print_receipt", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns receipt URL when ready", async () => {
    // First call creates the print request
    mockPost.mockResolvedValueOnce({
      entity: { uuid: "print-uuid-1" },
      requests: [{ request_uuid: "req-p1", type: "CREATE", state: "ACCEPTED" }],
    });
    // Second call (polling) returns the URL
    mockGet.mockResolvedValueOnce({
      entity: { uuid: "print-uuid-1", url: "https://api.cdek.ru/print/receipt.pdf" },
    });

    const result = await handlePrintReceipt({ order_uuid: "order-uuid-1", copy_count: 1 });
    const parsed = JSON.parse(result);
    expect(parsed.url).toContain("receipt.pdf");
    expect(parsed.uuid).toBe("print-uuid-1");
  });

  it("handles print creation error", async () => {
    mockPost.mockResolvedValueOnce({
      errors: [{ code: "v2_print_error", message: "Order not ready" }],
    });

    const result = await handlePrintReceipt({ order_uuid: "bad-uuid", copy_count: 1 });
    expect(result).toContain("Ошибка создания квитанции");
  });
});

describe("create_webhook", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns webhook confirmation", async () => {
    mockPost.mockResolvedValueOnce({
      entity: { uuid: "wh-uuid-1", url: "https://example.com/webhook", type: "ORDER_STATUS" },
      requests: [{ request_uuid: "req-wh", type: "CREATE", state: "ACCEPTED" }],
    });

    const result = await handleCreateWebhook({
      url: "https://example.com/webhook",
      type: "ORDER_STATUS",
    });

    const parsed = JSON.parse(result);
    expect(parsed.uuid).toBe("wh-uuid-1");
    expect(parsed.тип).toBe("ORDER_STATUS");
    expect(parsed.статус_запроса).toBe("ACCEPTED");
  });

  it("handles API errors", async () => {
    mockPost.mockResolvedValueOnce({
      errors: [{ code: "v2_webhook_error", message: "Invalid URL" }],
    });

    const result = await handleCreateWebhook({
      url: "https://bad-url.com",
      type: "ORDER_STATUS",
    });

    expect(result).toContain("Ошибка создания вебхука");
  });
});
