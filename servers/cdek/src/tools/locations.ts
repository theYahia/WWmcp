import { z } from "zod";
import { getClient } from "../client.js";
import type { CdekCity, CdekDeliveryPoint } from "../types.js";

export const getCitiesSchema = z.object({
  city: z.string().optional().describe("Название города (поиск по подстроке)"),
  postal_code: z.string().optional().describe("Почтовый индекс"),
  country_codes: z.string().optional().describe("Коды стран через запятую (например RU,KZ)"),
  size: z.number().int().min(1).max(1000).default(50).describe("Количество результатов (по умолчанию 50)"),
  page: z.number().int().min(0).default(0).describe("Номер страницы (с 0)"),
});

export const listDeliveryPointsSchema = z.object({
  city_code: z.number().optional().describe("Код города СДЭК"),
  postal_code: z.string().optional().describe("Почтовый индекс"),
  type: z.enum(["PVZ", "POSTAMAT", "ALL"]).default("ALL").describe("Тип пункта: PVZ (пункт выдачи), POSTAMAT (постамат), ALL"),
  country_code: z.string().default("RU").describe("Код страны (по умолчанию RU)"),
  latitude: z.number().min(-90).max(90).optional()
    .describe("Широта точки отсчёта для гео-поиска (нужны также longitude и radius_km)"),
  longitude: z.number().min(-180).max(180).optional()
    .describe("Долгота точки отсчёта для гео-поиска (нужны также latitude и radius_km)"),
  radius_km: z.number().positive().max(1000).optional()
    .describe("Радиус поиска в км от (latitude, longitude). Фильтрация и сортировка по расстоянию на стороне клиента"),
  size: z.number().int().min(1).max(1000).default(50).describe("Количество результатов"),
  page: z.number().int().min(0).default(0).describe("Номер страницы (с 0)"),
});

export const getRegionsSchema = z.object({
  country_codes: z.string().optional().describe("Коды стран через запятую (например RU,KZ)"),
  region: z.string().optional().describe("Название региона (поиск по подстроке)"),
  size: z.number().int().min(1).max(1000).default(50).describe("Количество результатов"),
  page: z.number().int().min(0).default(0).describe("Номер страницы (с 0)"),
});

/** Great-circle distance between two WGS-84 points, in kilometres. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // средний радиус Земли, км
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function handleGetRegions(params: z.infer<typeof getRegionsSchema>): Promise<string> {
  const query: Record<string, string> = {
    size: String(params.size),
    page: String(params.page),
  };
  if (params.country_codes) query.country_codes = params.country_codes;
  if (params.region) query.region = params.region;

  const result = (await getClient().get("/location/regions", query)) as Array<{
    country_code: string;
    region: string;
    region_code: number;
    prefix: string;
  }>;

  if (!Array.isArray(result) || result.length === 0) {
    return "Регионы не найдены по заданным параметрам.";
  }

  return JSON.stringify(result.map(r => ({
    код_региона: r.region_code,
    регион: r.region,
    страна: r.country_code,
    префикс: r.prefix,
  })), null, 2);
}

export async function handleGetCities(params: z.infer<typeof getCitiesSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.city) query.city = params.city;
  if (params.postal_code) query.postal_code = params.postal_code;
  if (params.country_codes) query.country_codes = params.country_codes;
  query.size = String(params.size);
  query.page = String(params.page);

  const result = (await getClient().get("/location/cities", query)) as CdekCity[];

  if (!Array.isArray(result) || result.length === 0) {
    return "Города не найдены по заданным параметрам.";
  }

  return JSON.stringify(result.map(c => ({
    код: c.code,
    город: c.city,
    регион: c.region,
    страна: c.country_code,
    индекс_фиас: c.fias_guid,
  })), null, 2);
}

function formatDeliveryPoint(p: CdekDeliveryPoint): Record<string, unknown> {
  return {
    код: p.code,
    название: p.name,
    тип: p.type,
    город: p.location.city,
    адрес: p.location.address,
    индекс: p.location.postal_code,
    время_работы: p.work_time,
    примерочная: p.is_dressing_room,
    наличные: p.have_cash,
    безнал: p.have_cashless,
  };
}

export async function handleListDeliveryPoints(params: z.infer<typeof listDeliveryPointsSchema>): Promise<string> {
  const { latitude, longitude, radius_km } = params;
  const geoProvided = [latitude, longitude, radius_km].filter(v => v !== undefined).length;
  if (geoProvided > 0 && geoProvided < 3) {
    throw new Error(
      "Для гео-поиска нужны все три параметра: latitude, longitude и radius_km.",
    );
  }
  const geoMode = geoProvided === 3;

  // CDEK /deliverypoints не имеет server-side гео-радиуса — координаты в query не уходят,
  // фильтрация считается на клиенте. В гео-режиме берём максимум кандидатов.
  const query: Record<string, string> = {};
  if (params.city_code) query.city_code = String(params.city_code);
  if (params.postal_code) query.postal_code = params.postal_code;
  if (params.type !== "ALL") query.type = params.type;
  query.country_code = params.country_code;
  query.size = String(geoMode ? Math.max(params.size, 1000) : params.size);
  query.page = String(params.page);

  const result = (await getClient().get("/deliverypoints", query)) as CdekDeliveryPoint[];

  if (!Array.isArray(result) || result.length === 0) {
    return "Пункты выдачи не найдены по заданным параметрам.";
  }

  if (!geoMode) {
    return JSON.stringify(result.map(formatDeliveryPoint), null, 2);
  }

  const nearby = result
    .map(p => ({
      point: p,
      lat: p.location.latitude,
      lon: p.location.longitude,
      dist: haversineKm(latitude!, longitude!, p.location.latitude, p.location.longitude),
    }))
    .filter(x => Number.isFinite(x.dist) && x.dist <= radius_km!)
    .sort((a, b) => a.dist - b.dist)
    .map(x => ({
      ...formatDeliveryPoint(x.point),
      координаты: { широта: x.lat, долгота: x.lon },
      расстояние_км: Math.round(x.dist * 100) / 100,
    }));

  if (nearby.length === 0) {
    return `В радиусе ${radius_km} км от точки (${latitude}, ${longitude}) пунктов выдачи не найдено.`;
  }

  return JSON.stringify(nearby, null, 2);
}
