import { describe, it, expect, vi, afterEach } from "vitest";

// Set token before module load
process.env.BOXBERRY_API_TOKEN = "test-token";

describe("tools", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handleListCities", () => {
    it("returns filtered cities", async () => {
      const cities = [
        { Code: "1", Name: "Москва", Region: "Московская", CountryCode: "RU" },
        { Code: "2", Name: "Казань", Region: "Татарстан", CountryCode: "RU" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(cities), { status: 200 })
      );

      const { handleListCities } = await import("../src/tools/cities.js");
      const result = await handleListCities({ search: "Моск" });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toHaveProperty("город", "Москва");
    });
  });

  describe("handleTrack", () => {
    it("returns tracking statuses", async () => {
      const statuses = [
        { Date: "2025-01-01", Name: "Принят", Comment: "Склад" },
        { Date: "2025-01-02", Name: "Доставлен", Comment: "ПВЗ" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(statuses), { status: 200 })
      );

      const { handleTrack } = await import("../src/tools/tracking.js");
      const result = await handleTrack({ tracking_number: "ABC123" });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("последний_статус");
      expect(parsed.последний_статус.статус).toBe("Доставлен");
    });
  });

  describe("handleCalcDelivery", () => {
    it("returns delivery calculation", async () => {
      const calc = { price: 350, price_base: 300, price_service: 50, delivery_period: 3 };
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(calc), { status: 200 })
      );

      const { handleCalcDelivery } = await import("../src/tools/calculate.js");
      const result = await handleCalcDelivery({
        target: "010", weight: 1000, order_sum: 0, delivery_sum: 0, pay_sum: 0,
      });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("стоимость_доставки", 350);
      expect(parsed).toHaveProperty("срок_дней", 3);
    });
  });

  describe("handleListPoints", () => {
    it("returns delivery points", async () => {
      const points = [
        { Code: "P1", Name: "ПВЗ 1", Address: "ул. Ленина 1", Phone: "+7900",
          WorkSchedule: "9-18", DeliveryPeriod: 2, CityName: "Москва", GPS: "55.7,37.6" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(points), { status: 200 })
      );

      const { handleListPoints } = await import("../src/tools/points.js");
      const result = await handleListPoints({ city_code: "1", prepaid: "0" });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toHaveProperty("код", "P1");
    });
  });

  describe("handleZipCodes", () => {
    it("returns zip check result", async () => {
      const zipResult = [
        { ExpressDelivery: "1", ZoneExpressDelivery: "2", ReceptionLaP: "1", DeliveryLaP: "1" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(zipResult), { status: 200 })
      );

      const { handleZipCodes } = await import("../src/tools/zip-codes.js");
      const result = await handleZipCodes({ zip: "101000" });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("индекс", "101000");
      expect(parsed.зона_доставки).toHaveLength(1);
    });
  });

  describe("handleListServices", () => {
    it("returns services list", async () => {
      const services = [
        { Name: "Доставка", Sum: "350", Date: "2025-01-02", PaymentMethod: "Наличные" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(services), { status: 200 })
      );

      const { handleListServices } = await import("../src/tools/services.js");
      const result = await handleListServices({ tracking_number: "ABC123" });
      const parsed = JSON.parse(result);
      expect(parsed.услуги).toHaveLength(1);
      expect(parsed.услуги[0]).toHaveProperty("название", "Доставка");
    });
  });
});
