/**
 * Tests for 2GIS HTTP client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchItems, getItem, geocodeAddress, reverseGeocode, suggest, getReviews } from "../src/client.js";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  process.env.TWOGIS_API_KEY = "test-2gis-key";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.TWOGIS_API_KEY;
});

function mockResponse(status: number, body: unknown = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe("searchItems", () => {
  it("sends correct URL with API key", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    await searchItems({ q: "кофейня" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("catalog.api.2gis.com");
    expect(url).toContain("key=test-2gis-key");
  });

  it("returns data on 200", async () => {
    const body = { result: { total: 1, items: [{ id: "1", name: "test" }] } };
    mockFetch.mockResolvedValueOnce(mockResponse(200, body));
    const result = await searchItems({ q: "test" });
    expect(result.error).toBeNull();
    expect(result.data).toEqual(body);
  });

  it("returns error on 401 without exposing key", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(401));
    const result = await searchItems({ q: "test" });
    expect(result.error).toContain("Authentication failed");
    expect(result.error).not.toContain("test-2gis-key");
  });

  it("returns error when API key is missing", async () => {
    delete process.env.TWOGIS_API_KEY;
    const result = await searchItems({ q: "test" });
    expect(result.error).toContain("TWOGIS_API_KEY is not set");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("retries on 500 and succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(500))
      .mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    const result = await searchItems({ q: "test" });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("geocodeAddress", () => {
  it("calls geocode endpoint", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    await geocodeAddress("Москва");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("geocode");
  });
});

describe("reverseGeocode", () => {
  it("sends lat/lon params", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    await reverseGeocode(55.75, 37.61);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("lat=55.75");
    expect(url).toContain("lon=37.61");
  });
});

describe("suggest", () => {
  it("calls suggest endpoint", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    await suggest("Москва");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("suggests");
  });
});

describe("getReviews", () => {
  it("calls reviews endpoint", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { result: { items: [] } }));
    await getReviews("12345", 5);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("reviews");
    expect(url).toContain("12345");
  });
});
