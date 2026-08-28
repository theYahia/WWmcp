import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Tools construct a PochtaClient on first use -> need credentials in env.
vi.stubEnv("POCHTA_TOKEN", "T");
vi.stubEnv("POCHTA_LOGIN", "user");
vi.stubEnv("POCHTA_PASSWORD", "pass");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("get_offices (kebab-case response)", () => {
  it("normalizes a single office by postal code without null fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        "postal-code": "101000",
        "address-source": "г Москва, ул Мясницкая, 26",
        region: "Москва",
        latitude: 55.7616,
        longitude: 37.6312,
        "work-time": "пн-пт 08:00-20:00",
        phones: [{ "phone-number": "+7 495 000-00-00" }],
      }),
    );
    const { handleGetOffices } = await import("../src/tools/offices.js");

    const out = JSON.parse(await handleGetOffices({ postal_code: "101000", top: 20 }));
    expect(out.индекс).toBe("101000");
    expect(out.адрес).toBe("г Москва, ул Мясницкая, 26");
    expect(out.широта).toBe(55.7616);
    expect(out.график).toBe("пн-пт 08:00-20:00");
    expect(out.телефоны).toEqual(["+7 495 000-00-00"]);

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://otpravka-api.pochta.ru/postoffice/1.0/101000");
  });

  it("maps a nearby array", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        { "postal-code": "630099", region: "Новосибирская обл", place: "Новосибирск" },
      ]),
    );
    const { handleGetOffices } = await import("../src/tools/offices.js");

    const out = JSON.parse(await handleGetOffices({ settlement: "Новосибирск", top: 5 }));
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].индекс).toBe("630099");
    expect(out[0].адрес).toContain("Новосибирск");
  });
});

describe("zip_lookup (kebab-case response)", () => {
  it("returns non-null region/work-time from kebab fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        "postal-code": "190000",
        region: "Санкт-Петербург",
        area: "",
        place: "Санкт-Петербург",
        "address-source": "г Санкт-Петербург",
        "type-code": "31",
        "work-time": "круглосуточно",
      }),
    );
    const { handleZipLookup } = await import("../src/tools/zip_lookup.js");

    const out = JSON.parse(await handleZipLookup({ postal_code: "190000" }));
    expect(out.индекс).toBe("190000");
    expect(out.регион).toBe("Санкт-Петербург");
    expect(out.тип_отделения).toBe("31");
    expect(out.график).toBe("круглосуточно");
  });
});

describe("calculate (kebab-case tariff response)", () => {
  it("reads total-rate / ground-rate / delivery-time", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        "total-rate": 35000,
        "total-nds": 5833,
        "ground-rate": { rate: 30000, vat: 5000 },
        "delivery-time": { "min-days": 3, "max-days": 7 },
        notice: "ok",
      }),
    );
    const { handleCalculate } = await import("../src/tools/calculate.js");

    const out = JSON.parse(
      await handleCalculate({
        from_index: "101000",
        to_index: "630099",
        weight: 1000,
        mail_type: "POSTAL_PARCEL",
        mail_category: "ORDINARY",
      }),
    );
    expect(out.стоимость_всего_коп).toBe(35000);
    expect(out.наземная_пересылка.стоимость_коп).toBe(30000);
    expect(out.срок_доставки.мин_дней).toBe(3);
    expect(out.срок_доставки.макс_дней).toBe(7);
  });
});
