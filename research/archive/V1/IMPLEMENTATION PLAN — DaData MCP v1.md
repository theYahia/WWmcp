---
title: "IMPLEMENTATION PLAN — @neuraldeep/dadata-mcp v1.0"
date: 2026-03-29
tags: [neuraldeep, dadata, mcp, implementation, plan]
status: ready-to-execute
---

# IMPLEMENTATION PLAN — @neuraldeep/dadata-mcp v1.0

Подробнейший пошаговый план. Каждый шаг = конкретное действие с кодом.
Основан на глубоком ресёрче (Researches/V1/).

---

## Контекст

- **Платформа:** Windows 11, bash shell, Node.js 22+
- **Стек проекта:** TypeScript 5.9+, ESM modules
- **Репо:** отдельный проект вне OpenClaw → `D:/DEV/Yahia/neuraldeep/dadata-mcp/`
- **GitHub:** `github.com/neuraldeep/dadata-mcp` (создать)
- **npm:** `@neuraldeep/dadata-mcp` (scope @neuraldeep зарегистрировать на npm)
- **Конкурент:** Официальный MCP DaData (4 tools) — мы делаем 8 tools + resources + prompts
- **Цель:** первый полноценный MCP для DaData → засветиться в РФ AI-комьюнити

---

## ФАЗА 0: Подготовка инфраструктуры (30 мин)

### 0.1 Создать npm organization
```bash
# На npmjs.com:
# 1. Зайти на https://www.npmjs.com/org/create
# 2. Создать org "neuraldeep" (бесплатный план)
# 3. Это даст scope @neuraldeep для пакетов
```

### 0.2 Создать GitHub organization и репо
```bash
# На github.com:
# 1. Создать org "neuraldeep" (или использовать личный аккаунт)
# 2. Создать репо "dadata-mcp" (public, MIT license, без README — создадим сами)
```

### 0.3 Подать заявку на реферальную программу DaData
```
# https://dadata.ru/referral/
# Получить реферальную ссылку (30% revenue share)
# Понадобится для README и onboarding flow
```

### 0.4 Получить API-ключи DaData
```
# https://dadata.ru/profile/#info
# Бесплатный тариф: 10 000 запросов/день
# Записать:
#   DADATA_API_KEY=<token>
#   DADATA_SECRET_KEY=<secret>
```

---

## ФАЗА 1: Scaffold проекта (30 мин)

### 1.1 Создать директорию и инициализировать
```bash
mkdir -p /d/DEV/Yahia/neuraldeep/dadata-mcp
cd /d/DEV/Yahia/neuraldeep/dadata-mcp
git init
```

### 1.2 package.json
```json
{
  "name": "@neuraldeep/dadata-mcp",
  "version": "1.0.0",
  "description": "Full-featured MCP server for DaData.ru — Russian address validation, company lookup, phone/email cleaning, geocoding for AI agents",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "dadata-mcp": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "inspector": "npx @modelcontextprotocol/inspector node dist/index.js",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.28.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  },
  "publishConfig": {
    "access": "public"
  },
  "keywords": [
    "mcp", "mcp-server", "dadata", "address", "geocoding",
    "russia", "ai", "claude", "company", "inn", "validation"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/neuraldeep/dadata-mcp.git"
  },
  "homepage": "https://github.com/neuraldeep/dadata-mcp#readme",
  "bugs": {
    "url": "https://github.com/neuraldeep/dadata-mcp/issues"
  },
  "author": "neuraldeep"
}
```

### 1.3 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 1.4 .gitignore
```
node_modules/
dist/
.env
*.tgz
```

### 1.5 .env.example
```bash
# Required — get from https://dadata.ru/profile/#info
DADATA_API_KEY=your_api_key_here

# Optional — required only for clean/standardize tools (phone, address, name)
# Without this, suggest and findById tools still work (free, 10K req/day)
DADATA_SECRET_KEY=your_secret_key_here
```

### 1.6 LICENSE (MIT)
```
MIT License

Copyright (c) 2026 neuraldeep

Permission is hereby granted, free of charge, to any person obtaining a copy
...стандартный MIT текст...
```

### 1.7 Установить зависимости
```bash
npm install
```

### 1.8 Создать структуру папок
```bash
mkdir -p src/tools src/resources src/prompts src/lib
```

---

## ФАЗА 2: DaData HTTP Client (1 час)

### 2.1 Файл: `src/types.ts` — типы API

Все типы для DaData responses. Не полные (80+ полей у адреса) — только те что мы возвращаем.

```typescript
// Suggestion wrapper
export interface DaDataSuggestion<T> {
  value: string;
  unrestricted_value: string;
  data: T;
}

export interface SuggestResponse<T> {
  suggestions: DaDataSuggestion<T>[];
}

// Address data (отфильтрованные поля)
export interface AddressData {
  postal_code: string | null;
  country: string | null;
  country_iso_code: string | null;
  region_with_type: string | null;
  region_fias_id: string | null;
  city_with_type: string | null;
  city_fias_id: string | null;
  settlement_with_type: string | null;
  street_with_type: string | null;
  house: string | null;
  flat: string | null;
  fias_id: string | null;
  fias_level: string | null;
  kladr_id: string | null;
  geo_lat: string | null;
  geo_lon: string | null;
  qc_geo: number | null;
  timezone: string | null;
}

// Company data
export interface PartyData {
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  ogrn_date: number | null;
  type: "LEGAL" | "INDIVIDUAL";
  name: {
    full_with_opf: string | null;
    short_with_opf: string | null;
    full: string | null;
    short: string | null;
  };
  opf: { code: string; full: string; short: string } | null;
  state: {
    status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED" | "BANKRUPT" | "REORGANIZING";
    registration_date: number | null;
    liquidation_date: number | null;
  };
  management: { name: string; post: string } | null;
  address: { value: string; data: AddressData } | null;
  okved: string | null;
  okved_type: string | null;
  employee_count: number | null;
  branch_count: number | null;
  branch_type: "MAIN" | "BRANCH" | null;
  finance: {
    tax_system: string | null;
    income: number | null;
    expense: number | null;
    debt: number | null;
    penalty: number | null;
  } | null;
}

// Bank data
export interface BankData {
  bic: string | null;
  swift: string | null;
  inn: string | null;
  kpp: string | null;
  registration_number: string | null;
  correspondent_account: string | null;
  name: { payment: string | null; full: string | null; short: string | null };
  address: { value: string } | null;
  state: { status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED"; registration_date: number | null };
  opf: { type: "CBR" | "BANK" | "NKO" | "BANK_BRANCH" | "NKO_BRANCH" | "OTHER" } | null;
}

// Clean phone response
export interface CleanPhoneResult {
  source: string;
  type: string;
  phone: string;
  country_code: string;
  city_code: string;
  number: string;
  extension: string;
  provider: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  qc_conflict: number;
  qc: number;
}

// Clean address response
export interface CleanAddressResult {
  source: string;
  result: string;
  postal_code: string | null;
  region_with_type: string | null;
  city_with_type: string | null;
  street_with_type: string | null;
  house: string | null;
  flat: string | null;
  geo_lat: string | null;
  geo_lon: string | null;
  fias_id: string | null;
  kladr_id: string | null;
  qc: number;
  qc_geo: number;
  qc_complete: number;
  qc_house: number;
  timezone: string | null;
  metro: Array<{ name: string; line: string; distance: number }> | null;
  unparsed_parts: string | null;
}

// IP locate response
export interface IpLocateResponse {
  location: DaDataSuggestion<AddressData> | null;
}
```

### 2.2 Файл: `src/client.ts` — HTTP клиент

Два домена, два типа auth, retry с exponential backoff, таймаут.

```typescript
const SUGGESTIONS_BASE = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";
const CLEANER_BASE = "https://cleaner.dadata.ru/api/v1/clean";
const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 2;

// --- Config ---
export function getApiKey(): string {
  const key = process.env.DADATA_API_KEY;
  if (!key) throw new Error("DADATA_API_KEY environment variable is required");
  return key;
}

export function getSecretKey(): string | undefined {
  return process.env.DADATA_SECRET_KEY;
}

// --- Fetch with timeout ---
async function fetchWithTimeout(
  url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// --- Error mapping ---
function mapHttpError(status: number): string {
  const errors: Record<number, string> = {
    401: "Invalid API key. Check DADATA_API_KEY — get yours at https://dadata.ru/profile/#info",
    402: "Daily limit exceeded (10K free requests/day) or insufficient balance for paid endpoints",
    403: "Access forbidden. This endpoint may require DADATA_SECRET_KEY or a paid plan",
    405: "Method not allowed — check endpoint URL",
    413: "Request too large (query exceeds 300 characters)",
    429: "Rate limit exceeded (30 req/s). Wait ~5 minutes before retrying",
  };
  return errors[status] ?? `DaData API error (HTTP ${status})`;
}

// --- Core API call with retry ---
async function callAPI(
  url: string, body: unknown, headers: Record<string, string>
): Promise<{ data: any; error: string | null }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", ...headers },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return { data: await response.json(), error: null };
      }

      // Retry on 429 and 5xx
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }

      return { data: null, error: mapHttpError(response.status) };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { data: null, error: "Request timed out (10s). DaData may be experiencing issues." };
      }
      if (attempt < MAX_RETRIES) continue;
      return { data: null, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  return { data: null, error: "Max retries exceeded" };
}

// --- Public API methods ---

/** Suggestions API — requires only API_KEY */
export async function callSuggestions(endpoint: string, body: object) {
  return callAPI(
    `${SUGGESTIONS_BASE}/${endpoint}`,
    body,
    { Authorization: `Token ${getApiKey()}` }
  );
}

/** Cleaner API — requires API_KEY + SECRET_KEY */
export async function callCleaner(type: string, values: string[]) {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return {
      data: null,
      error: "DADATA_SECRET_KEY is required for standardization endpoints. "
           + "Add it to your MCP client env config. Get it at https://dadata.ru/profile/#info"
    };
  }
  return callAPI(
    `${CLEANER_BASE}/${type}`,
    values,
    { Authorization: `Token ${getApiKey()}`, "X-Secret": secretKey }
  );
}

/** GET request for profile endpoints */
export async function callProfileAPI(endpoint: string) {
  try {
    const response = await fetchWithTimeout(
      `https://dadata.ru/api/v2/${endpoint}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${getApiKey()}`,
          "X-Secret": getSecretKey() ?? "",
        },
      }
    );
    if (response.ok) return { data: await response.json(), error: null };
    return { data: null, error: mapHttpError(response.status) };
  } catch (err) {
    return { data: null, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
```

### 2.3 Файл: `src/lib/formatters.ts` — форматирование ответов

```typescript
// MCP response helpers — НИКОГДА не throw, всегда return
export function success(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function error(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

// Quality code labels — человекочитаемые пояснения для AI
export const QC_ADDRESS: Record<number, string> = {
  0: "Address recognized with certainty",
  1: "Address recognized with assumptions — verify manually",
  2: "Address partially recognized (city/region only)",
  3: "Address not recognized — input may be invalid",
};

export const QC_GEO: Record<number, string> = {
  0: "Exact coordinates (house level)",
  1: "Nearest house coordinates",
  2: "Street-level coordinates",
  3: "Settlement-level coordinates",
  4: "City-level coordinates",
  5: "Coordinates not available",
};

export const QC_PHONE: Record<number, string> = {
  0: "Valid phone number",
  1: "Partially valid — needs manual check",
  2: "Invalid or empty phone",
  3: "Multiple phone numbers detected",
  7: "Foreign phone number",
};

export const COMPANY_STATUS: Record<string, string> = {
  ACTIVE: "Active (operating normally)",
  LIQUIDATING: "In liquidation process",
  LIQUIDATED: "Liquidated (no longer exists)",
  BANKRUPT: "In bankruptcy proceedings",
  REORGANIZING: "Undergoing reorganization",
};

// Timestamp to readable date
export function tsToDate(ts: number | null): string | null {
  if (!ts) return null;
  return new Date(ts).toISOString().split("T")[0];
}
```

---

## ФАЗА 3: MCP Tools — 8 инструментов (2-3 часа)

Правило: **каждый tool = одна функция, один файл-группа, описание <200 символов**.

### 3.1 Файл: `src/tools/suggest.ts`

Два tool'а: `suggest_address` и `suggest_company`.

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callSuggestions } from "../client.js";
import { success, error, QC_GEO } from "../lib/formatters.js";
import type { AddressData, PartyData, SuggestResponse } from "../types.js";

export function registerSuggestTools(server: McpServer) {

  // --- suggest_address ---
  server.tool(
    "suggest_address",
    "Autocomplete Russian addresses. Returns suggestions with postal code, FIAS ID, coordinates.",
    {
      query: z.string().min(1).max(300).describe("Partial address in any format"),
      count: z.number().int().min(1).max(20).default(5).describe("Number of suggestions (max 20)"),
      language: z.enum(["ru", "en"]).default("ru").describe("Response language"),
      from_bound: z.enum(["country","region","area","city","settlement","street","house"]).optional()
        .describe("Min granularity level"),
      to_bound: z.enum(["country","region","area","city","settlement","street","house"]).optional()
        .describe("Max granularity level"),
      locations: z.array(z.record(z.string(), z.string())).optional()
        .describe("Filter by region/city. Example: [{\"region_fias_id\":\"...\"}]"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        query: params.query,
        count: params.count,
        language: params.language,
      };
      if (params.from_bound) body.from_bound = { value: params.from_bound };
      if (params.to_bound) body.to_bound = { value: params.to_bound };
      if (params.locations) body.locations = params.locations;

      const { data, error: err } = await callSuggestions("suggest/address", body);
      if (err) return error(err);

      const resp = data as SuggestResponse<AddressData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No addresses found for "${params.query}". Try a shorter or broader query.`,
        });
      }

      return success({
        count: resp.suggestions.length,
        suggestions: resp.suggestions.map(s => ({
          address: s.value,
          postal_code: s.data.postal_code,
          region: s.data.region_with_type,
          city: s.data.city_with_type,
          settlement: s.data.settlement_with_type,
          street: s.data.street_with_type,
          house: s.data.house,
          flat: s.data.flat,
          geo: s.data.geo_lat ? { lat: s.data.geo_lat, lon: s.data.geo_lon } : null,
          geo_quality: s.data.qc_geo != null ? QC_GEO[s.data.qc_geo] : null,
          fias_id: s.data.fias_id,
          kladr_id: s.data.kladr_id,
          timezone: s.data.timezone,
        })),
      });
    }
  );

  // --- suggest_company ---
  server.tool(
    "suggest_company",
    "Search Russian companies by name, INN, or OGRN. Returns legal details, address, CEO.",
    {
      query: z.string().min(1).max(300).describe("Company name, INN, or OGRN"),
      count: z.number().int().min(1).max(20).default(5),
      status: z.array(z.enum(["ACTIVE","LIQUIDATING","LIQUIDATED","BANKRUPT","REORGANIZING"])).optional()
        .describe("Filter by status"),
      type: z.enum(["LEGAL","INDIVIDUAL"]).optional()
        .describe("LEGAL = companies, INDIVIDUAL = entrepreneurs"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        query: params.query,
        count: params.count,
      };
      if (params.status) body.status = params.status;
      if (params.type) body.type = params.type;

      const { data, error: err } = await callSuggestions("suggest/party", body);
      if (err) return error(err);

      const resp = data as SuggestResponse<PartyData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No companies found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        companies: resp.suggestions.map(s => formatCompany(s.data)),
      });
    }
  );
}

// Shared company formatter — used by suggest and find
export function formatCompany(d: PartyData) {
  return {
    name: d.name?.short_with_opf ?? d.name?.full_with_opf,
    full_name: d.name?.full_with_opf,
    inn: d.inn,
    kpp: d.kpp,
    ogrn: d.ogrn,
    ogrn_date: d.ogrn_date ? new Date(d.ogrn_date).toISOString().split("T")[0] : null,
    type: d.type,
    status: d.state?.status,
    status_description: d.state?.status ? COMPANY_STATUS[d.state.status] : null,
    ceo: d.management?.name ?? null,
    ceo_title: d.management?.post ?? null,
    address: d.address?.value ?? null,
    okved: d.okved,
    employees: d.employee_count,
    branches: d.branch_count,
    branch_type: d.branch_type,
    finance: d.finance ? {
      tax_system: d.finance.tax_system,
      income: d.finance.income,
      expense: d.finance.expense,
    } : null,
  };
}

import { COMPANY_STATUS } from "../lib/formatters.js";
```

### 3.2 Файл: `src/tools/find.ts`

Два tool'а: `find_company_by_id` и `find_bank`.

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import { formatCompany } from "./suggest.js";
import type { PartyData, BankData, SuggestResponse } from "../types.js";

export function registerFindTools(server: McpServer) {

  // --- find_company_by_id ---
  server.tool(
    "find_company_by_id",
    "Get company details by INN or OGRN. Returns registration, status, CEO, address, OKVED.",
    {
      query: z.string().describe("Company INN (10 or 12 digits) or OGRN (13 or 15 digits)"),
      branch_type: z.enum(["MAIN","BRANCH"]).optional(),
      kpp: z.string().optional().describe("KPP to find specific branch"),
    },
    async (params) => {
      const body: Record<string, unknown> = { query: params.query };
      if (params.branch_type) body.branch_type = params.branch_type;
      if (params.kpp) body.kpp = params.kpp;

      const { data, error: err } = await callSuggestions("findById/party", body);
      if (err) return error(err);

      const resp = data as SuggestResponse<PartyData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No company found for "${params.query}". Check that the INN/OGRN is correct.`,
        });
      }

      // findById обычно возвращает 1 результат
      return success(formatCompany(resp.suggestions[0].data));
    }
  );

  // --- find_bank ---
  server.tool(
    "find_bank",
    "Find bank by BIC, SWIFT, INN, or name. Returns correspondent account, address, status.",
    {
      query: z.string().describe("Bank BIC, SWIFT code, INN, or name"),
      count: z.number().int().min(1).max(20).default(5),
    },
    async (params) => {
      const { data, error: err } = await callSuggestions("suggest/bank", {
        query: params.query,
        count: params.count,
      });
      if (err) return error(err);

      const resp = data as SuggestResponse<BankData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No bank found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        banks: resp.suggestions.map(s => ({
          name: s.data.name?.payment ?? s.data.name?.short,
          full_name: s.data.name?.full,
          bic: s.data.bic,
          swift: s.data.swift,
          inn: s.data.inn,
          kpp: s.data.kpp,
          correspondent_account: s.data.correspondent_account,
          registration_number: s.data.registration_number,
          address: s.data.address?.value ?? null,
          status: s.data.state?.status ?? null,
          type: s.data.opf?.type ?? null,
        })),
      });
    }
  );
}
```

### 3.3 Файл: `src/tools/clean.ts`

Два tool'а: `clean_address` и `clean_phone`.

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callCleaner } from "../client.js";
import { success, error, QC_ADDRESS, QC_GEO, QC_PHONE } from "../lib/formatters.js";
import type { CleanAddressResult, CleanPhoneResult } from "../types.js";

export function registerCleanTools(server: McpServer) {

  // --- clean_address ---
  server.tool(
    "clean_address",
    "Standardize a Russian address. Returns structured fields, coordinates, quality codes. Paid: 0.20 RUB.",
    {
      address: z.string().min(1).describe("Address in any format to standardize"),
    },
    async (params) => {
      const { data, error: err } = await callCleaner("address", [params.address]);
      if (err) return error(err);

      const r = (Array.isArray(data) ? data[0] : data) as CleanAddressResult;
      return success({
        source: r.source,
        result: r.result,
        postal_code: r.postal_code,
        region: r.region_with_type,
        city: r.city_with_type,
        street: r.street_with_type,
        house: r.house,
        flat: r.flat,
        geo: r.geo_lat ? { lat: r.geo_lat, lon: r.geo_lon } : null,
        fias_id: r.fias_id,
        timezone: r.timezone,
        metro: r.metro,
        quality: QC_ADDRESS[r.qc] ?? `Unknown (qc=${r.qc})`,
        geo_quality: QC_GEO[r.qc_geo] ?? `Unknown (qc_geo=${r.qc_geo})`,
        confidence: r.qc === 0 ? "high" : r.qc === 1 ? "medium" : "low",
        unparsed_parts: r.unparsed_parts,
      });
    }
  );

  // --- clean_phone ---
  server.tool(
    "clean_phone",
    "Validate and standardize a phone number. Returns carrier, region, timezone, type. Paid: 0.20 RUB.",
    {
      phone: z.string().min(1).describe("Phone number in any format"),
    },
    async (params) => {
      const { data, error: err } = await callCleaner("phone", [params.phone]);
      if (err) return error(err);

      const r = (Array.isArray(data) ? data[0] : data) as CleanPhoneResult;
      return success({
        source: r.source,
        phone: r.phone,
        type: r.type,
        country_code: r.country_code,
        city_code: r.city_code,
        number: r.number,
        extension: r.extension || null,
        carrier: r.provider,
        country: r.country,
        region: r.region,
        city: r.city,
        timezone: r.timezone,
        quality: QC_PHONE[r.qc] ?? `Unknown (qc=${r.qc})`,
        is_valid: r.qc === 0,
      });
    }
  );
}
```

### 3.4 Файл: `src/tools/geo.ts`

Два tool'а: `geolocate_address` и `ip_locate`.

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { AddressData, SuggestResponse, IpLocateResponse } from "../types.js";

export function registerGeoTools(server: McpServer) {

  // --- geolocate_address ---
  server.tool(
    "geolocate_address",
    "Reverse geocoding: find nearest addresses by lat/lon coordinates.",
    {
      lat: z.number().min(-90).max(90).describe("Latitude"),
      lon: z.number().min(-180).max(180).describe("Longitude"),
      radius_meters: z.number().min(1).max(1000).default(100).describe("Search radius in meters"),
      count: z.number().int().min(1).max(20).default(5),
    },
    async (params) => {
      const { data, error: err } = await callSuggestions("geolocate/address", {
        lat: params.lat,
        lon: params.lon,
        radius_meters: params.radius_meters,
        count: params.count,
      });
      if (err) return error(err);

      const resp = data as SuggestResponse<AddressData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No addresses found near ${params.lat}, ${params.lon} within ${params.radius_meters}m.`,
        });
      }

      return success({
        count: resp.suggestions.length,
        addresses: resp.suggestions.map(s => ({
          address: s.value,
          postal_code: s.data.postal_code,
          city: s.data.city_with_type,
          fias_id: s.data.fias_id,
        })),
      });
    }
  );

  // --- ip_locate ---
  server.tool(
    "ip_locate",
    "Detect Russian city by IPv4 address. Returns city name, coordinates, FIAS ID.",
    {
      ip: z.string().describe("IPv4 address (e.g. 46.226.227.20)"),
    },
    async (params) => {
      const { data, error: err } = await callSuggestions("iplocate/address", {
        ip: params.ip,
      });
      if (err) return error(err);

      const resp = data as IpLocateResponse;
      if (!resp.location) {
        return success({
          status: "not_found",
          message: `Could not determine location for IP ${params.ip}. May be a non-Russian IP.`,
        });
      }

      return success({
        ip: params.ip,
        city: resp.location.value,
        geo: resp.location.data.geo_lat
          ? { lat: resp.location.data.geo_lat, lon: resp.location.data.geo_lon }
          : null,
        fias_id: resp.location.data.city_fias_id,
        kladr_id: resp.location.data.kladr_id,
        region: resp.location.data.region_with_type,
      });
    }
  );
}
```

---

## ФАЗА 4: Resources и Prompts (30 мин)

### 4.1 Файл: `src/resources/reference.ts`

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResources(server: McpServer) {

  server.resource(
    "quality-codes",
    "dadata://reference/quality-codes",
    { description: "DaData quality codes (qc, qc_geo) for address and phone validation" },
    async () => ({
      contents: [{
        uri: "dadata://reference/quality-codes",
        mimeType: "text/markdown",
        text: [
          "# DaData Quality Codes",
          "",
          "## Address (qc)",
          "- 0: Exactly recognized",
          "- 1: Recognized with assumptions",
          "- 2: Partially recognized (city only)",
          "- 3: Not recognized",
          "",
          "## Geocoding (qc_geo)",
          "- 0: Exact house coordinates",
          "- 1: Nearest house",
          "- 2: Street level",
          "- 3: Settlement level",
          "- 4: City level",
          "- 5: No coordinates",
          "",
          "## Phone (qc)",
          "- 0: Valid",
          "- 1: Partially valid",
          "- 2: Invalid/empty",
          "- 3: Multiple numbers found",
          "- 7: Foreign number",
          "",
          "## Confidence mapping",
          "- qc=0 → high confidence",
          "- qc=1 → medium confidence (verify manually)",
          "- qc≥2 → low confidence (likely invalid)",
        ].join("\n"),
      }],
    })
  );

  server.resource(
    "capabilities",
    "dadata://reference/capabilities",
    { description: "What DaData API can and cannot do — free vs paid features" },
    async () => ({
      contents: [{
        uri: "dadata://reference/capabilities",
        mimeType: "text/markdown",
        text: [
          "# DaData API Capabilities",
          "",
          "## Free (10K requests/day)",
          "- Address autocomplete (Russia: to apartment, World: to city)",
          "- Company search by name/INN/OGRN (basic: name, status, CEO, address, main OKVED)",
          "- Bank search by BIC/SWIFT/INN",
          "- Reverse geocoding (coordinates → address)",
          "- IP geolocation (IPv4 → Russian city)",
          "",
          "## Paid (0.20 RUB per record)",
          "- Address standardization (80+ fields, coordinates, quality codes)",
          "- Phone validation (carrier, region, timezone, type)",
          "- Name parsing (surname/name/patronymic, gender)",
          "- Email validation (type, disposable check)",
          "",
          "## Premium tiers (14K-56K RUB/year)",
          "- All OKVEDs, employee count, tax system",
          "- Founders, managers, financial data",
          "- Affiliated companies search",
          "- Licenses, fines, debts",
        ].join("\n"),
      }],
    })
  );
}
```

### 4.2 Файл: `src/prompts/workflows.ts`

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {

  server.prompt(
    "check_counterparty",
    "Due diligence check on a Russian company by INN",
    { inn: z.string().describe("Company INN to check") },
    ({ inn }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Проведи проверку контрагента по ИНН ${inn}:

1. Используй find_company_by_id чтобы получить данные компании
2. Проверь статус: ACTIVE = ок, LIQUIDATING/BANKRUPT = красный флаг
3. Оцени дату регистрации (менее 1 года = повышенный риск)
4. Проверь наличие руководителя
5. Выдай заключение: надёжный / требует внимания / высокий риск

Ответ на русском языке.`,
        },
      }],
    })
  );

  server.prompt(
    "validate_address",
    "Validate and standardize a Russian address with quality assessment",
    { address: z.string().describe("Address to validate") },
    ({ address }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Проверь и стандартизируй адрес: "${address}"

1. Сначала используй suggest_address для поиска подходящих вариантов
2. Если нашёлся точный match — используй clean_address для полной стандартизации
3. Оцени качество по кодам qc и qc_geo
4. Верни стандартизированный адрес с почтовым индексом, координатами и оценкой качества

Ответ на русском языке.`,
        },
      }],
    })
  );
}
```

---

## ФАЗА 5: Entry Point — сборка сервера (20 мин)

### 5.1 Файл: `src/index.ts`

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSuggestTools } from "./tools/suggest.js";
import { registerFindTools } from "./tools/find.js";
import { registerCleanTools } from "./tools/clean.js";
import { registerGeoTools } from "./tools/geo.js";
import { registerResources } from "./resources/reference.js";
import { registerPrompts } from "./prompts/workflows.js";

// Validate required env
if (!process.env.DADATA_API_KEY) {
  console.error("[dadata-mcp] ERROR: DADATA_API_KEY not set. Get yours at https://dadata.ru/profile/#info");
  process.exit(1);
}

if (!process.env.DADATA_SECRET_KEY) {
  console.error("[dadata-mcp] INFO: DADATA_SECRET_KEY not set. clean_address and clean_phone tools will be unavailable.");
}

// Create server
const server = new McpServer({
  name: "dadata-mcp",
  version: "1.0.0",
});

// Register all tools (8 total)
registerSuggestTools(server);   // suggest_address, suggest_company
registerFindTools(server);      // find_company_by_id, find_bank
registerCleanTools(server);     // clean_address, clean_phone
registerGeoTools(server);       // geolocate_address, ip_locate

// Register resources (2 total)
registerResources(server);

// Register prompts (2 total)
registerPrompts(server);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[dadata-mcp] Server started. 8 tools, 2 resources, 2 prompts ready.");
```

---

## ФАЗА 6: Тестирование (1 час)

### 6.1 Сборка и проверка
```bash
npm run build
# Должен скомпилироваться без ошибок в dist/

# Проверить что бинарник работает
DADATA_API_KEY=test node dist/index.js
# Должен вывести в stderr: "[dadata-mcp] INFO: DADATA_SECRET_KEY not set..."
# И ждать JSON-RPC на stdin (Ctrl+C чтобы выйти)
```

### 6.2 MCP Inspector — интерактивная проверка
```bash
DADATA_API_KEY=<your_key> DADATA_SECRET_KEY=<your_secret> \
  npx @modelcontextprotocol/inspector node dist/index.js
# Откроет UI на http://localhost:6274
# Проверить каждый tool вручную:
# - suggest_address: query="москва сухонская 11"
# - suggest_company: query="сбербанк"
# - find_company_by_id: query="7707083893"
# - find_bank: query="044525225"
# - clean_address: address="мск сухонская 11 кв 89"
# - clean_phone: phone="8 916 823 3454"
# - geolocate_address: lat=55.7558, lon=37.6173
# - ip_locate: ip="46.226.227.20"
```

### 6.3 Claude Desktop — реальная проверка
Добавить в `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "dadata": {
      "command": "node",
      "args": ["D:/DEV/Yahia/neuraldeep/dadata-mcp/dist/index.js"],
      "env": {
        "DADATA_API_KEY": "<your_key>",
        "DADATA_SECRET_KEY": "<your_secret>"
      }
    }
  }
}
```
Перезапустить Claude Desktop. Проверить:
- "Найди компанию по ИНН 7707083893"
- "Стандартизируй адрес: мск сухонская 11"
- "Какой город у IP 46.226.227.20?"

### 6.4 Unit тесты (опционально для v1, обязательно для v1.1)
```bash
# Файл: tests/client.test.ts
# Mock fetch, проверить:
# - Правильные headers для Suggestions vs Cleaner
# - Retry на 429
# - Timeout handling
# - Error mapping
```

---

## ФАЗА 7: README и документация (1 час)

### 7.1 README.md — структура

```markdown
# @neuraldeep/dadata-mcp

> Full-featured MCP server for DaData.ru — Russian address, company, phone
> validation and geocoding for AI agents (Claude, Cursor, Windsurf)

[badges: npm version, license, MCP compatible]

[GIF демо — Claude Desktop диалог]

## Why this instead of official DaData MCP?

| Feature | Official MCP | @neuraldeep/dadata-mcp |
|---------|-------------|----------------------|
| Tools | 4 | **8** (12 in v1.1) |
| Resources | 0 | **2** |
| Prompts | 0 | **2** |
| Transport | Remote (needs proxy) | **Local stdio** |
| Free tools | 1 | **6** |

## Quick Start

### Claude Desktop / Claude Code / VS Code / Cursor
[JSON конфиги для каждого клиента]

## Tools
[Таблица 8 tools с описаниями и примерами]

## Resources & Prompts
[Описание]

## Environment Variables
[Таблица]

## Examples
[3-4 реальных диалога]

## Free vs Paid
[Какие tools бесплатные, какие платные]

## Development
[git clone, npm install, npm run build, npm run inspector]

## License
MIT
```

### 7.2 Запись GIF демо
```bash
# Вариант 1: VHS (charmbracelet/vhs) — скрипт → GIF
# Вариант 2: Скриншот диалога в Claude Desktop
# Вариант 3: asciinema + agg
```

---

## ФАЗА 8: Публикация (30 мин)

### 8.1 npm publish
```bash
cd /d/DEV/Yahia/neuraldeep/dadata-mcp
npm login
npm publish --access public
# Проверить: https://www.npmjs.com/package/@neuraldeep/dadata-mcp
```

### 8.2 Проверить npx
```bash
DADATA_API_KEY=xxx npx -y @neuraldeep/dadata-mcp
# Должен запуститься и ждать JSON-RPC
```

### 8.3 GitHub push
```bash
git remote add origin https://github.com/neuraldeep/dadata-mcp.git
git add -A
git commit -m "feat: initial release — 8 tools, 2 resources, 2 prompts"
git push -u origin main
```

### 8.4 GitHub Release
```bash
gh release create v1.0.0 --title "v1.0.0 — Initial Release" --notes "..."
```

---

## ФАЗА 9: Go-to-Market (дни 2-7)

### 9.1 Листинг в каталогах (день 2-3)

| Каталог | Как | Приоритет |
|---------|-----|-----------|
| Official MCP Registry | `smithery mcp publish` | FIRST |
| modelcontextprotocol/servers | PR в community секцию | FIRST |
| glama.ai | Кнопка "Add Server" | HIGH |
| smithery.ai | CLI publish | HIGH |
| mcp.so | Issue в chatmcp/mcpso | MEDIUM |
| PulseMCP | pulsemcp.com | MEDIUM |
| mcp.directory | Submit | MEDIUM |

### 9.2 Habr статья (день 4-7, вт-чт 13:00 МСК)

**Заголовок:** "Как я сделал MCP-сервер для DaData: подключаем Claude к российским API за 5 минут"

**Хабы:** Программирование, API, Open Source, Искусственный интеллект, Node.js

**Структура:**
1. Проблема: 0.05% российских сервисов в MCP
2. Решение: @neuraldeep/dadata-mcp
3. Демо: скриншоты Claude Desktop
4. Как устроен MCP-сервер (архитектура, код)
5. Как подключить за 2 минуты
6. Планы: ЮKassa, hh.ru, СДЭК
7. CTA: GitHub stars, Telegram @neuraldeep

**ВАЖНО:** Связаться с DaData ДО публикации — они продвигают партнёрские решения.

### 9.3 Telegram (день 4-7)

Создать канал @neuraldeep. Посты в:
- LLM продакшн
- AI Happens (@AIhappens)
- Tproger AI

---

## ФАЗА 10: Post-Launch (неделя 2+)

### 10.1 GitHub Issues для контрибьюторов
Создать с labels `good first issue` + `help wanted`:
- "Add suggest_fio tool"
- "Add clean_name tool"
- "Add clean_email tool"
- "Add get_balance tool"
- "Add Docker support"
- "Add response caching (TTL)"

### 10.2 v1.1 план (через 2-4 недели)
- +4 tools: suggest_fio, clean_name, clean_email, get_balance
- In-memory TTL cache
- Docker image
- Улучшенные типы

### 10.3 Мониторинг
- npm downloads: `npm info @neuraldeep/dadata-mcp`
- GitHub stars, issues, PRs
- Habr views и комменты

---

## Чеклист перед стартом кодинга

- [ ] npm org @neuraldeep создан
- [ ] GitHub repo создан
- [ ] DaData API ключ получен (бесплатный)
- [ ] DaData Secret ключ получен
- [ ] Реферальная заявка подана
- [ ] Директория `D:/DEV/Yahia/neuraldeep/dadata-mcp/` готова

---

## Оценка времени

| Фаза | Время | Что |
|------|-------|-----|
| 0. Подготовка | 30 мин | npm org, GitHub, DaData ключи |
| 1. Scaffold | 30 мин | package.json, tsconfig, структура |
| 2. HTTP Client | 1 час | client.ts, types.ts, formatters.ts |
| 3. 8 Tools | 2-3 часа | suggest, find, clean, geo |
| 4. Resources + Prompts | 30 мин | reference.ts, workflows.ts |
| 5. Entry point | 20 мин | index.ts |
| 6. Тестирование | 1 час | Build, Inspector, Claude Desktop |
| 7. README | 1 час | Документация, GIF |
| 8. Публикация | 30 мин | npm, GitHub, release |
| **ИТОГО** | **~7-8 часов** | **Один интенсивный день** |
