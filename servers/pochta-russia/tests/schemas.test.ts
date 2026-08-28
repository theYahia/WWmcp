import { describe, it, expect } from "vitest";
import { trackSchema } from "../src/tools/tracking.js";
import { calculateSchema } from "../src/tools/calculate.js";
import { getOfficesSchema } from "../src/tools/offices.js";
import { zipLookupSchema } from "../src/tools/zip_lookup.js";
import { deliveryTimeSchema } from "../src/tools/delivery_time.js";
import { normalizeAddressSchema } from "../src/tools/normalize_address.js";

describe("Tool schemas", () => {
  describe("track", () => {
    it("accepts valid barcode", () => {
      const result = trackSchema.safeParse({ barcode: "RA123456789RU" });
      expect(result.success).toBe(true);
    });
    it("rejects missing barcode", () => {
      const result = trackSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("calculate", () => {
    it("accepts valid params with defaults", () => {
      const result = calculateSchema.safeParse({
        from_index: "101000",
        to_index: "630099",
        weight: 500,
      });
      expect(result.success).toBe(true);
      expect(result.data!.mail_type).toBe("POSTAL_PARCEL");
      expect(result.data!.mail_category).toBe("SIMPLE");
    });
    it("rejects zero weight", () => {
      const result = calculateSchema.safeParse({
        from_index: "101000", to_index: "630099", weight: 0,
      });
      expect(result.success).toBe(false);
    });
    it("accepts declared_value and dimension_type", () => {
      const result = calculateSchema.safeParse({
        from_index: "101000", to_index: "630099", weight: 1000,
        mail_type: "EMS", mail_category: "WITH_DECLARED_VALUE",
        declared_value: 50000, dimension_type: "M",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("get_offices", () => {
    it("accepts postal_code only", () => {
      const result = getOfficesSchema.safeParse({ postal_code: "101000" });
      expect(result.success).toBe(true);
    });
    it("accepts settlement search", () => {
      const result = getOfficesSchema.safeParse({ settlement: "Москва" });
      expect(result.success).toBe(true);
    });
    it("defaults top to 20", () => {
      const result = getOfficesSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data!.top).toBe(20);
    });
  });

  describe("zip_lookup", () => {
    it("accepts 6-digit code", () => {
      const result = zipLookupSchema.safeParse({ postal_code: "101000" });
      expect(result.success).toBe(true);
    });
    it("rejects non-6-digit code", () => {
      expect(zipLookupSchema.safeParse({ postal_code: "12345" }).success).toBe(false);
      expect(zipLookupSchema.safeParse({ postal_code: "abc123" }).success).toBe(false);
    });
  });

  describe("delivery_time", () => {
    it("accepts valid indexes", () => {
      const result = deliveryTimeSchema.safeParse({
        from_index: "101000", to_index: "630099",
      });
      expect(result.success).toBe(true);
      expect(result.data!.mail_type).toBe("POSTAL_PARCEL");
    });
    it("rejects invalid index format", () => {
      expect(deliveryTimeSchema.safeParse({ from_index: "ABC", to_index: "630099" }).success).toBe(false);
    });
  });

  describe("normalize_address", () => {
    it("accepts any string", () => {
      const result = normalizeAddressSchema.safeParse({ raw_address: "Москва, Красная площадь, 1" });
      expect(result.success).toBe(true);
    });
    it("rejects empty call", () => {
      expect(normalizeAddressSchema.safeParse({}).success).toBe(false);
    });
  });
});
