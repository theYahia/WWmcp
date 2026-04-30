# Детальный план: cdek-mcp · tkassa-mcp · travelpayouts-mcp
**Версия:** 2.0 (корректированная после npm-инспекции)
**Дата:** 2026-04-06

---

## КЛЮЧЕВОЕ ОТКРЫТИЕ: npm 2.x >> local 1.2.0

Первый план был неверен. npm-пакеты уже содержат гораздо больше инструментов, чем локальный код. Локальный код = старая версия, npm = актуальная.

### Реальный разрыв (после `npm pack` + `tar -tzf`):

| Сервер | local | npm | Инструментов в npm | Цель |
|--------|-------|-----|---------------------|------|
| cdek-mcp | 1.2.0 (8 tools) | **2.0.2 (14 tools)** | см. секцию 1 | 16 |
| tkassa-mcp | 1.2.0 (5 tools) | **2.0.1 (14 tools)** | см. секцию 2 | 16 |
| travelpayouts-mcp | 1.2.0 (3 tools) | **2.0.1 (11 tools)** | см. секцию 3 | 13 |

### Инструменты в npm 2.x (верифицировано из dist/*.js):

**CDEK 2.0.2 — 14 tools:**
`calculate_tariff`, `calculate_tariff_list`, `create_order`, `get_order`, `delete_order`, `track_shipment`, `get_cities`, `get_regions`, `list_delivery_points`, `generate_barcode`, `create_courier_pickup`, `get_courier_pickup`, `print_receipt`, `create_webhook`

**TKASSA 2.0.1 — 14 tools:**
`init_payment`, `get_payment_state`, `confirm_payment`, `cancel_payment`, `charge_payment`, `refund_payment`, `add_customer`, `get_customer`, `remove_customer`, `get_card_list`, `remove_card`, `create_sbp_qr`, `get_sbp_qr_state`, `send_closing_receipt`

**TRAVELPAYOUTS 2.0.1 — 11 tools:**
`search_flights_prices`, `get_cheapest_month`, `get_calendar_prices`, `get_popular_directions`, `get_airline_directions`, `get_special_offers`, `search_hotels`, `get_hotel_prices`, `lookup_airports`, `lookup_airlines`, `lookup_cities`

---

## СТРАТЕГИЯ

```
Шаг 1: Восстановить src/ из npm 2.x dist (reverse-engineer)
Шаг 2: Добавить 2 новых инструмента поверх для cdek и tkassa
Шаг 3: Согласовать версии (src=package.json=smithery.yaml)
Шаг 4: Тесты → build → publish
```

**Travelpayouts уже имеет 11 tools (> цели 10+).** Задача только merge+2 новых.

---

## 1. CDEK-MCP: 14 → 16 инструментов

### 1.1 Что уже есть в npm 2.0.2 и отсутствует в local

**Новые tool-файлы которые нужно восстановить в `servers/cdek/src/tools/`:**

#### `intake.ts` (восстановить из npm dist)

```typescript
import { z } from "zod";
import { getClient } from "../client.js";

export const createIntakeSchema = z.object({
  order_uuid: z.string().describe("UUID заказа для вызова курьера"),
  intake_date: z.string().describe("Дата забора (YYYY-MM-DD)"),
  intake_time_from: z.string().describe("Время забора с (HH:MM)"),
  intake_time_to: z.string().describe("Время забора до (HH:MM)"),
  name: z.string().optional().describe("ФИО отправителя"),
  phone: z.string().optional().describe("Телефон отправителя"),
  comment: z.string().optional().describe("Комментарий для курьера"),
});

export const getIntakeSchema = z.object({
  uuid: z.string().describe("UUID заявки на вызов курьера"),
});

export async function handleCreateIntake(
  params: z.infer<typeof createIntakeSchema>
): Promise<string> {
  const body: Record<string, unknown> = {
    order_uuid: params.order_uuid,
    intake_date: params.intake_date,
    intake_time_from: params.intake_time_from,
    intake_time_to: params.intake_time_to,
  };
  if (params.name) body.name = params.name;
  if (params.phone) body.phone = params.phone;
  if (params.comment) body.comment = params.comment;

  const result = (await getClient().post("/intakes", body)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: {
      uuid: string;
      order_uuid: string;
      intake_date: string;
      intake_time_from: string;
      intake_time_to: string;
    };
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка создания заявки на курьера: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    order_uuid: result.entity?.order_uuid,
    дата_забора: result.entity?.intake_date,
    время_с: result.entity?.intake_time_from,
    время_до: result.entity?.intake_time_to,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Заявка на вызов курьера создана.",
  }, null, 2);
}

export async function handleGetIntake(
  params: z.infer<typeof getIntakeSchema>
): Promise<string> {
  const result = (await getClient().get(`/intakes/${params.uuid}`)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: {
      uuid: string;
      order_uuid: string;
      cdek_number?: string;
      intake_date: string;
      intake_time_from: string;
      intake_time_to: string;
      statuses?: Array<{ code: string; name: string; date_time: string }>;
    };
  };

  if (result.errors?.length) {
    return `Ошибка: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  const entity = result.entity;
  return JSON.stringify({
    uuid: entity?.uuid,
    order_uuid: entity?.order_uuid,
    номер_сдэк: entity?.cdek_number,
    дата_забора: entity?.intake_date,
    время_с: entity?.intake_time_from,
    время_до: entity?.intake_time_to,
    статусы: entity?.statuses?.map(s => ({ код: s.code, название: s.name, дата: s.date_time })),
  }, null, 2);
}
```

---

#### `print.ts` (восстановить из npm dist)

```typescript
import { z } from "zod";
import { getClient } from "../client.js";

export const printReceiptSchema = z.object({
  order_uuid: z.string().describe("UUID заказа для печати квитанции"),
  copy_count: z.number().int().min(1).max(10).default(1)
    .describe("Количество копий (1-10)"),
});

export async function handlePrintReceipt(
  params: z.infer<typeof printReceiptSchema>
): Promise<string> {
  // Создать задание на печать
  const createResult = (await getClient().post("/print/orders", {
    orders: [{ order_uuid: params.order_uuid }],
    copy_count: params.copy_count,
  })) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: { uuid: string };
  };

  if (createResult.errors?.length) {
    return `Ошибка создания квитанции: ${createResult.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  const printUuid = createResult.entity?.uuid;
  if (!printUuid) return "Не удалось создать квитанцию: UUID не получен.";

  // Polling — квитанция формируется асинхронно (до 10 сек)
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const getResult = (await getClient().get(`/print/orders/${printUuid}`)) as {
      entity?: { url?: string; statuses?: Array<{ code: string; name: string }> };
    };

    if (getResult.entity?.url) {
      return JSON.stringify({
        uuid: printUuid,
        url: getResult.entity.url,
        сообщение: "Квитанция готова к скачиванию.",
      }, null, 2);
    }

    const status = getResult.entity?.statuses?.[0];
    if (status?.code === "FAIL") {
      return `Ошибка формирования квитанции: ${status.name}`;
    }
  }

  return JSON.stringify({
    uuid: printUuid,
    сообщение: "Квитанция формируется. Проверьте позже по UUID.",
  }, null, 2);
}
```

---

#### `webhooks.ts` (восстановить из npm dist)

```typescript
import { z } from "zod";
import { getClient } from "../client.js";

export const createWebhookSchema = z.object({
  url: z.string().url()
    .describe("URL для получения уведомлений (HTTPS)"),
  type: z.enum(["ORDER_STATUS", "DOWNLOAD_PHOTO"])
    .describe("Тип вебхука: ORDER_STATUS (статусы заказов) или DOWNLOAD_PHOTO"),
});

export async function handleCreateWebhook(
  params: z.infer<typeof createWebhookSchema>
): Promise<string> {
  const result = (await getClient().post("/webhooks", params)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: { uuid: string; url: string; type: string };
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка создания вебхука: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    url: result.entity?.url,
    тип: result.entity?.type,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Вебхук создан. СДЭК будет отправлять POST-уведомления на указанный URL.",
  }, null, 2);
}
```

**Внимание:** npm 2.0.2 содержит только `create_webhook` (без get/delete). `calculate_tariff_list` и `get_regions` — тоже уже в npm.

### 1.2 Два НОВЫХ инструмента (доводим до 16)

#### Tool 15: `list_orders`

```
API: GET /v2/orders
Файл: src/tools/orders.ts (добавить к существующим)
```

Поиск/фильтрация заказов по дате и статусу. В npm 2.0.2 отсутствует — это действительно новый.

```typescript
export const listOrdersSchema = z.object({
  date_invoice_from: z.string().optional()
    .describe("Дата начала периода (формат YYYY-MM-DDTHH:MM:SS±HH:MM)"),
  date_invoice_to: z.string().optional()
    .describe("Дата окончания периода"),
  im_number: z.string().optional()
    .describe("Номер заказа интернет-магазина"),
  cdek_number: z.string().optional()
    .describe("Накладная СДЭК"),
  size: z.number().min(1).max(1000).default(50)
    .describe("Кол-во записей (макс. 1000)"),
  page: z.number().min(0).default(0)
    .describe("Страница (0-based)"),
});

export async function handleListOrders(
  params: z.infer<typeof listOrdersSchema>
): Promise<string> {
  const query: Record<string, string> = {
    size: String(params.size),
    page: String(params.page),
  };
  if (params.date_invoice_from) query.date_invoice_from = params.date_invoice_from;
  if (params.date_invoice_to) query.date_invoice_to = params.date_invoice_to;
  if (params.im_number) query.im_number = params.im_number;
  if (params.cdek_number) query.cdek_number = params.cdek_number;

  const result = await getClient().get("/orders", query);
  return JSON.stringify(result, null, 2);
}
```

#### Tool 16: `delete_webhook`

```
API: DELETE /v2/webhooks/{uuid}
Файл: src/tools/webhooks.ts (добавить)
```

Удаление подписки на вебхуки. Необходим для управления вебхуками (create без delete = неполная функциональность).

```typescript
export const deleteWebhookSchema = z.object({
  uuid: z.string().uuid().describe("UUID вебхука для удаления"),
});

export async function handleDeleteWebhook(
  params: z.infer<typeof deleteWebhookSchema>
): Promise<string> {
  const result = (await getClient().delete(`/webhooks/${params.uuid}`)) as {
    errors?: Array<{ code: string; message: string }>;
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка удаления: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    статус: result.requests?.[0]?.state,
    сообщение: `Вебхук ${params.uuid} удалён.`,
  }, null, 2);
}
```

**ВАЖНО:** `getClient().delete()` — нужно проверить что в `BaseHttpClient` из mcp-core есть метод `delete`. Если нет — добавить через `request("DELETE", path)`.

### 1.3 Архитектурное решение: CDEK

**Оставляем архитектуру local (`runServer` из mcp-core).** НЕ переносим npm 2.0.2 server.ts+express.

Причина: npm 2.0.2 использует собственный factory+express, потому что он строился отдельно. Наш local использует `runServer` из `@theyahia/mcp-core` — это стандарт для всех `servers/` в репо (dual transport stdio+HTTP уже встроен).

Что делаем: **только добавляем новые tool-файлы и обновляем импорты в существующем `index.ts`**. Транспорт не трогаем.

### 1.4 Полный `index.ts` после изменений

```typescript
// Добавить к существующим импортам:
import { calculateTariffListSchema, handleCalculateTariffList } from "./tools/calculate.js"; // новая экспортируемая ф-я
import { getRegionsSchema, handleGetRegions } from "./tools/locations.js"; // новая экспортируемая ф-я
import { listOrdersSchema, handleListOrders } from "./tools/orders.js"; // новая экспортируемая ф-я
import { createIntakeSchema, handleCreateIntake, getIntakeSchema, handleGetIntake } from "./tools/intake.js";
import { printReceiptSchema, handlePrintReceipt } from "./tools/print.js";
import { createWebhookSchema, handleCreateWebhook, deleteWebhookSchema, handleDeleteWebhook } from "./tools/webhooks.js";

// Изменить:
version: "2.1.0",
toolCount: 16,
```

### 1.5 Изменения в package.json

```json
{
  "version": "2.1.0",
  "description": "MCP server for CDEK delivery API — 16 tools: calculate, orders, courier pickup, tracking, PVZ, print, webhooks"
}
```

### 1.6 Тесты (добавить в `tests/tools.test.ts`)

```typescript
it("create_courier_pickup calls POST /intakes", async () => {
  await handleTool(client, "create_courier_pickup", {
    order_uuid: "test-uuid",
    intake_date: "2024-12-01",
    intake_time_from: "10:00",
    intake_time_to: "18:00",
  });
  expect(client.post).toHaveBeenCalledWith("/intakes", expect.objectContaining({
    order_uuid: "test-uuid",
  }));
});

it("print_receipt polls GET /print/orders/:uuid after POST", async () => {
  (client.post as Mock).mockResolvedValueOnce({ entity: { uuid: "print-uuid" } });
  (client.get as Mock).mockResolvedValue({ entity: { url: "https://cdn.cdek.ru/receipt.pdf" } });
  const result = await handleTool(client, "print_receipt", { order_uuid: "order-uuid" });
  expect(result).toContain("receipt.pdf");
});

it("list_orders calls GET /orders with params", async () => {
  await handleTool(client, "list_orders", { date_invoice_from: "2024-01-01T00:00:00+0300", size: 10 });
  expect(client.get).toHaveBeenCalledWith("/orders", expect.objectContaining({
    date_invoice_from: "2024-01-01T00:00:00+0300",
    size: "10",
  }));
});

it("create_webhook calls POST /webhooks", async () => {
  await handleTool(client, "create_webhook", { url: "https://example.com/hook", type: "ORDER_STATUS" });
  expect(client.post).toHaveBeenCalledWith("/webhooks", expect.objectContaining({ type: "ORDER_STATUS" }));
});

it("delete_webhook calls DELETE /webhooks/:uuid", async () => {
  await handleTool(client, "delete_webhook", { uuid: "hook-uuid" });
  expect(client.delete).toHaveBeenCalledWith("/webhooks/hook-uuid");
});
```

---

## 2. TKASSA-MCP: 14 → 16 инструментов

### 2.1 Что уже есть в npm 2.0.1 и отсутствует в local

**Новые файлы для восстановления в `servers/tkassa/src/tools/`:**

#### `customers.ts` (восстановить)

```typescript
import { z } from "zod";
import { TKassaClient } from "../client.js";
const client = new TKassaClient();

export const addCustomerSchema = z.object({
  customer_key: z.string().describe("Уникальный ID покупателя в вашей системе"),
  email: z.string().email().optional().describe("Email покупателя"),
  phone: z.string().optional().describe("Телефон покупателя (+71234567890)"),
});
export const getCustomerSchema = z.object({ customer_key: z.string() });
export const removeCustomerSchema = z.object({ customer_key: z.string() });
export const getCardListSchema = z.object({
  customer_key: z.string().describe("ID покупателя для получения списка карт"),
});
export const removeCardSchema = z.object({
  customer_key: z.string(),
  card_id: z.number().describe("ID карты (из get_card_list)"),
});

export async function handleAddCustomer(params: z.infer<typeof addCustomerSchema>): Promise<string> {
  const body: Record<string, unknown> = { CustomerKey: params.customer_key };
  if (params.email) body.Email = params.email;
  if (params.phone) body.Phone = params.phone;
  return JSON.stringify(await client.post("/AddCustomer", body), null, 2);
}
export async function handleGetCustomer(params: z.infer<typeof getCustomerSchema>): Promise<string> {
  return JSON.stringify(await client.post("/GetCustomer", { CustomerKey: params.customer_key }), null, 2);
}
export async function handleRemoveCustomer(params: z.infer<typeof removeCustomerSchema>): Promise<string> {
  return JSON.stringify(await client.post("/RemoveCustomer", { CustomerKey: params.customer_key }), null, 2);
}
export async function handleGetCardList(params: z.infer<typeof getCardListSchema>): Promise<string> {
  return JSON.stringify(await client.post("/GetCardList", { CustomerKey: params.customer_key }), null, 2);
}
export async function handleRemoveCard(params: z.infer<typeof removeCardSchema>): Promise<string> {
  return JSON.stringify(await client.post("/RemoveCard", { CustomerKey: params.customer_key, CardId: params.card_id }), null, 2);
}
```

#### `sbp.ts` (восстановить)

```typescript
import { z } from "zod";
import { TKassaClient } from "../client.js";
const client = new TKassaClient();

export const createSbpQrSchema = z.object({
  payment_id: z.string()
    .describe("ID платежа (из init_payment) для генерации QR-кода СБП"),
  data_type: z.enum(["PAYLOAD", "IMAGE"]).default("PAYLOAD")
    .describe("PAYLOAD = ссылка, IMAGE = base64 PNG"),
});
export const getSbpQrStateSchema = z.object({
  payment_id: z.string().describe("ID платежа для проверки статуса QR"),
});

export async function handleCreateSbpQr(params: z.infer<typeof createSbpQrSchema>): Promise<string> {
  return JSON.stringify(
    await client.post("/SbpPayTest", { PaymentId: params.payment_id, DataType: params.data_type }),
    null, 2
  );
}
export async function handleGetSbpQrState(params: z.infer<typeof getSbpQrStateSchema>): Promise<string> {
  return JSON.stringify(
    await client.post("/GetSbpPayTest", { PaymentId: params.payment_id }),
    null, 2
  );
}
```

**ВНИМАНИЕ по sbp.ts:** npm 2.0.1 использует `/SbpPayTest` для обоих методов — это выглядит как баг (тестовый endpoint). В проде нужно `/SbpPay` и `/GetSbpPaymentStatus`. Уточнить в документации T-Kassa перед публикацией.

#### `receipts.ts` (восстановить)

```typescript
import { z } from "zod";
import { TKassaClient, toKopecks } from "../client.js";
const client = new TKassaClient();

const receiptItemSchema = z.object({
  Name: z.string().max(128).describe("Название товара/услуги"),
  Price: z.number().positive().describe("Цена за единицу в рублях"),
  Quantity: z.number().positive().describe("Количество"),
  Amount: z.number().positive().describe("Сумма позиции в рублях (Price × Quantity)"),
  Tax: z.enum(["none", "vat0", "vat10", "vat20", "vat110", "vat120"])
    .describe("Ставка НДС"),
  PaymentMethod: z.enum([
    "full_prepayment", "prepayment", "advance", "full_payment",
    "partial_payment", "credit", "credit_payment",
  ]).default("full_payment").optional(),
  PaymentObject: z.enum([
    "commodity", "excise", "job", "service", "gambling_bet",
    "gambling_prize", "lottery", "lottery_prize", "intellectual_activity",
    "payment", "agent_commission", "composite", "another",
  ]).default("commodity").optional(),
});

export const sendClosingReceiptSchema = z.object({
  payment_id: z.string().describe("ID платежа для закрывающего чека"),
  email: z.string().email().optional().describe("Email для отправки чека"),
  phone: z.string().optional().describe("Телефон для отправки чека"),
  taxation: z.enum(["osn", "usn_income", "usn_income_outcome", "envd", "esn", "patent"])
    .describe("Система налогообложения"),
  items: z.array(receiptItemSchema).min(1)
    .describe("Позиции чека"),
});

export async function handleSendClosingReceipt(
  params: z.infer<typeof sendClosingReceiptSchema>
): Promise<string> {
  const receipt: Record<string, unknown> = {
    Taxation: params.taxation,
    Items: params.items.map(item => ({
      ...item,
      Price: toKopecks(item.Price),
      Amount: toKopecks(item.Amount),
    })),
  };
  if (params.email) receipt.Email = params.email;
  if (params.phone) receipt.Phone = params.phone;

  return JSON.stringify(
    await client.post("/SendClosingReceipt", { PaymentId: params.payment_id, Receipt: receipt }),
    null, 2
  );
}
```

#### Обновить `payments.ts` — добавить `charge_payment`

npm 2.0.1 содержит `charge_payment` (рекуррентный платёж по RebillId) которого нет в local:

```typescript
// Добавить в payments.ts:
export const chargeSchema = z.object({
  payment_id: z.string().describe("PaymentId исходного платежа с Recurrent=Y"),
  rebill_id: z.string().describe("RebillId карты (из уведомления или get_card_list)"),
  amount: z.number().positive().optional()
    .describe("Сумма в рублях (по умолчанию = исходная сумма)"),
});

export async function handleCharge(params: z.infer<typeof chargeSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    PaymentId: params.payment_id,
    RebillId: params.rebill_id,
  };
  if (params.amount) body.Amount = toKopecks(params.amount);
  return JSON.stringify(await getClient().post("/Charge", body), null, 2);
}
```

### 2.2 Два НОВЫХ инструмента (доводим до 16): T-Invest API

T-Bank Invest API (брокерский счёт) — это отдельный REST API.
**Base URL:** `https://invest-public-api.tinkoff.ru/rest`
**Auth:** `Authorization: Bearer {TINKOFF_INVEST_TOKEN}`
**Документация:** https://tinkoff.github.io/investAPI/

#### Новый файл `src/invest-client.ts`

```typescript
import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("tkassa-mcp/invest");
const INVEST_BASE = "https://invest-public-api.tinkoff.ru/rest";

export class TInvestClient {
  private readonly token: string;

  constructor() {
    this.token = process.env.TINKOFF_INVEST_TOKEN ?? "";
    // НЕ выбрасываем ошибку в конструкторе — Invest tools опциональны
  }

  isAvailable(): boolean {
    return this.token.length > 0;
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    if (!this.token) {
      throw new Error(
        "TINKOFF_INVEST_TOKEN не задан. " +
        "Создайте токен в приложении Тинькофф Инвестиции: Настройки → Токен для OpenAPI. " +
        "Нужен 'Read-only' или 'Full access' токен."
      );
    }

    const url = `${INVEST_BASE}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "x-app-name": "@theyahia/tkassa-mcp",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error("Invest API error", { path, status: res.status });
      throw new Error(`T-Invest API ${path} → ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }
}

let _invest: TInvestClient | null = null;
export function getInvestClient(): TInvestClient {
  if (!_invest) _invest = new TInvestClient();
  return _invest;
}
```

#### Tool 15: `get_invest_portfolio`

```
Файл: src/tools/invest.ts (новый)
API:  POST /tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio
```

Портфель инвестиций — акции, облигации, ETF, их текущая стоимость и P&L.

```typescript
import { z } from "zod";
import { getInvestClient } from "../invest-client.js";

export const getPortfolioSchema = z.object({
  account_id: z.string()
    .describe("ID брокерского счёта (получить через get_invest_accounts)"),
  currency: z.enum(["RUB", "USD", "EUR", "UNSPECIFIED"]).default("RUB")
    .describe("Валюта для агрегирования итогов"),
});

export async function handleGetPortfolio(
  params: z.infer<typeof getPortfolioSchema>
): Promise<string> {
  const client = getInvestClient();
  const result = await client.post(
    "/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio",
    {
      accountId: params.account_id,
      currency: params.currency === "UNSPECIFIED"
        ? "PORTFOLIO_CURRENCY_UNSPECIFIED"
        : params.currency,
    }
  );
  return JSON.stringify(result, null, 2);
}
```

#### Tool 16: `find_instrument`

```
Файл: src/tools/invest.ts (добавить)
API:  POST /tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument
```

Поиск торгового инструмента по тикеру или ISIN. Нужен для получения FIGI — ключа инструмента в системе T-Invest.

```typescript
export const findInstrumentSchema = z.object({
  query: z.string()
    .describe("Тикер, ISIN или название компании (напр. SBER, US0231351067, Сбербанк)"),
  instrument_kind: z.enum([
    "INSTRUMENT_TYPE_UNSPECIFIED",
    "INSTRUMENT_TYPE_SHARE",
    "INSTRUMENT_TYPE_BOND",
    "INSTRUMENT_TYPE_ETF",
    "INSTRUMENT_TYPE_CURRENCY",
  ]).default("INSTRUMENT_TYPE_UNSPECIFIED")
    .describe("Фильтр по типу инструмента"),
  api_trade_available_flag: z.boolean().default(true)
    .describe("Только доступные для торговли через API"),
});

export async function handleFindInstrument(
  params: z.infer<typeof findInstrumentSchema>
): Promise<string> {
  const client = getInvestClient();
  const result = await client.post(
    "/tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument",
    {
      query: params.query,
      instrumentKind: params.instrument_kind,
      apiTradeAvailableFlag: params.api_trade_available_flag,
    }
  );
  return JSON.stringify(result, null, 2);
}
```

### 2.3 Полный `index.ts` после изменений

```typescript
// Новые импорты (добавить):
import { addCustomerSchema, handleAddCustomer, getCustomerSchema, handleGetCustomer,
  removeCustomerSchema, handleRemoveCustomer, getCardListSchema, handleGetCardList,
  removeCardSchema, handleRemoveCard } from "./tools/customers.js";
import { createSbpQrSchema, handleCreateSbpQr,
  getSbpQrStateSchema, handleGetSbpQrState } from "./tools/sbp.js";
import { sendClosingReceiptSchema, handleSendClosingReceipt } from "./tools/receipts.js";
import { chargeSchema, handleCharge } from "./tools/payments.js"; // добавлен charge
import { getPortfolioSchema, handleGetPortfolio,
  findInstrumentSchema, handleFindInstrument } from "./tools/invest.js";

// Изменить:
const TOOL_COUNT = 16;
version: "2.1.0",  // npm 2.0.1, следующая = 2.1.0
```

### 2.4 Переменные окружения

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `TKASSA_TERMINAL_KEY` | Да | Терминал магазина в T-Kassa |
| `TKASSA_PASSWORD` | Да | Пароль для SHA-256 подписи |
| `TINKOFF_INVEST_TOKEN` | Нет | Токен T-Invest API (для tools 15–16) |

> Если `TINKOFF_INVEST_TOKEN` не задан — Invest tools (15–16) возвращают `isError: true` с понятным сообщением. Kassa tools (1–14) работают без него.

---

## 3. TRAVELPAYOUTS-MCP: восстановление + 2 новых (11 → 13)

### 3.1 Ситуация

npm 2.0.1 уже имеет **11 tools** (превышает цель 10+). Архитектура полностью переписана — npm не использует `runServer` из mcp-core, local — использует.

**Нужно выбрать:** принять npm-архитектуру или адаптировать под mcp-core.

**Рекомендация:** принять npm 2.0.1 как базу, так как:
1. Она уже работает в проде
2. Больше tools (11 vs 3)
3. Более структурирована (отдельные файлы: hotels.ts, lookup.ts)

### 3.2 Полная таблица tools в npm 2.0.1

| # | Tool | Файл | API |
|---|------|------|-----|
| 1 | `search_flights_prices` | flights.ts | `/aviasales/v3/prices_for_dates` |
| 2 | `get_cheapest_month` | flights.ts | `/aviasales/v3/...` |
| 3 | `get_calendar_prices` | flights.ts | `/aviasales/v3/calendar` |
| 4 | `get_popular_directions` | flights.ts (=popular_routes.ts) | `/aviasales/v3/get_special_offers` |
| 5 | `get_airline_directions` | flights.ts | `/aviasales/v3/airline-directions` |
| 6 | `get_special_offers` | flights.ts | `/aviasales/v3/get_special_offers` |
| 7 | `search_hotels` | hotels.ts | `/hotellook/v2/cache.json` |
| 8 | `get_hotel_prices` | hotels.ts | `/hotellook/v2/cache.json` |
| 9 | `lookup_airports` | lookup.ts | `/aviasales/v3/autocomplete` |
| 10 | `lookup_airlines` | lookup.ts | `/data/ru/airlines.json` |
| 11 | `lookup_cities` | lookup.ts | `/aviasales/v3/autocomplete` |

**Отличия от local 1.2.0:**
- `search_flights` → `search_flights_prices` (переименован)
- `get_popular_routes` → `get_popular_directions` (переименован)
- `get_prices_calendar` → `get_calendar_prices` (переименован)

### 3.3 КРИТИЧНО: Обновить `servers/travelpayouts/src/client.ts`

**Проблема:** local `tpGet(path: string)` — 1 параметр. npm 2.0.1 `hotels.js` вызывает `tpGet(path, true)` — 2 параметра, где `true` означает использовать hotellook base URL (`https://engine.hotellook.com/api/v2`) вместо основного (`https://api.travelpayouts.com`).

Без этого фикса `search_hotels` и `get_hotel_prices` будут слать запросы на неверный хост.

**Решение — заменить `src/client.ts` целиком:**

```typescript
import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("travelpayouts-mcp");

const TP_BASE = "https://api.travelpayouts.com";
const HOTELLOOK_BASE = "https://engine.hotellook.com/api/v2";

function createToken(): string {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error("TRAVELPAYOUTS_TOKEN is required. Get it at travelpayouts.com");
  return token;
}

let _token: string | null = null;
function getToken(): string {
  if (!_token) _token = createToken();
  return _token;
}

export async function tpGet(path: string, hotellook = false): Promise<unknown> {
  const token = getToken();
  const base = hotellook ? HOTELLOOK_BASE : TP_BASE;
  const sep = path.includes("?") ? "&" : "?";
  const url = `${base}${path}${sep}token=${token}`;

  logger.debug("tpGet", { url: url.replace(token, "***") });

  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Travelpayouts API ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}
```

**Изменения vs текущий client.ts:**
- Убрали зависимость от `BaseHttpClient` и `NoAuthStrategy` (не нужны — auth через query param)
- `tpGet` теперь принимает `hotellook = false` — второй параметр переключает base URL
- Прямой `fetch` вместо BaseHttpClient (у него нельзя менять baseUrl per-request)

### 3.5 Два НОВЫХ инструмента (доводим до 13)

#### Tool 12: `get_direct_routes`

```
API:  GET /aviasales/v3/prices_for_dates (с direct=true)
Файл: src/tools/flights.ts (добавить)
```

Только прямые рейсы без пересадок. Клиенты часто просят именно их.

```typescript
export const getDirectRoutesSchema = z.object({
  origin: z.string().describe("IATA код отправления (напр. MOW)"),
  destination: z.string().describe("IATA код назначения (напр. LED)"),
  departure_at: z.string().optional().describe("Дата/месяц вылета (YYYY-MM или YYYY-MM-DD)"),
  currency: z.string().default("rub"),
  limit: z.number().int().min(1).max(30).default(10),
});

export async function handleGetDirectRoutes(
  params: z.infer<typeof getDirectRoutesSchema>
): Promise<string> {
  const q = new URLSearchParams();
  q.set("origin", params.origin);
  q.set("destination", params.destination);
  q.set("direct", "true");
  q.set("currency", params.currency);
  q.set("limit", String(params.limit));
  if (params.departure_at) q.set("departure_at", params.departure_at);
  const result = await tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}
```

#### Tool 13: `get_nearest_prices`

```
API:  GET /aviasales/v3/prices_for_dates (с вариацией дат ±3 дня)
Файл: src/tools/flights.ts (добавить)
```

Цены на ±3 дня вокруг указанной даты — ответ на "лечу 15-го, но если на 14-е дешевле — тоже смотрю".

```typescript
export const getNearestPricesSchema = z.object({
  origin: z.string().describe("IATA код отправления"),
  destination: z.string().describe("IATA код назначения"),
  departure_at: z.string().describe("Центральная дата (YYYY-MM-DD)"),
  range_days: z.number().int().min(1).max(7).default(3)
    .describe("Диапазон дней в обе стороны (напр. 3 = ±3 дня)"),
  currency: z.string().default("rub"),
});

export async function handleGetNearestPrices(
  params: z.infer<typeof getNearestPricesSchema>
): Promise<string> {
  const baseDate = new Date(params.departure_at);
  const promises: Promise<unknown>[] = [];
  const dates: string[] = [];

  for (let d = -params.range_days; d <= params.range_days; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    dates.push(dateStr);
    const q = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departure_at: dateStr,
      currency: params.currency,
      limit: "3",
    });
    promises.push(tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}`));
  }

  const results = await Promise.allSettled(promises);
  const merged = dates.map((date, i) => ({
    date,
    data: results[i].status === "fulfilled" ? results[i].value : null,
  }));

  return JSON.stringify(merged, null, 2);
}
```

### 3.6 Обновление `index.ts`

```typescript
// Добавить:
import { getDirectRoutesSchema, handleGetDirectRoutes,
  getNearestPricesSchema, handleGetNearestPrices } from "./tools/flights.js";

server.tool("get_direct_routes", "...", getDirectRoutesSchema.shape, wrap(handleGetDirectRoutes));
server.tool("get_nearest_prices", "...", getNearestPricesSchema.shape, wrap(handleGetNearestPrices));

// Изменить в index.ts:
version: "2.1.0",  // было 2.0.0/2.0.1
// console.error: "13 tools"
```

---

## 4. РИСКИ И МИТИГАЦИЯ

| Риск | Уровень | Статус / Митигация |
|------|---------|-----------|
| ~~`BaseHttpClient` из mcp-core не имеет метода `delete()`~~ | ~~Средний~~ | **RESOLVED** — `delete()` существует в `packages/core/src/client.ts:76` |
| ~~`tpGet` не поддерживает hotellook base URL~~ | ~~Высокий~~ | **RESOLVED** — секция 3.3 показывает обновлённый `client.ts` с `hotellook = false` параметром |
| ~~CDEK npm архитектура (express) vs local (runServer)~~ | ~~Средний~~ | **RESOLVED** — секция 1.3 явно: оставляем `runServer` из mcp-core, только добавляем tool-файлы |
| sbp.ts использует `/SbpPayTest` (тестовый endpoint) | Высокий | Перед публикацией проверить документацию T-Kassa. Продовый endpoint: `/SbpPay` и `/GetSbpPaymentStatus` |
| T-Invest API: gRPC-gateway URLs могут измениться | Низкий | Документация актуальна на 2026-04, URL стабильны |
| travelpayouts hotels API: hotellook.com требует партнёрского token | Средний | Тот же `TRAVELPAYOUTS_TOKEN` работает для hotellook если есть партнёрский статус |
| `get_nearest_prices` делает N параллельных запросов (до 15) — rate limit | Средний | Добавить throttle или уменьшить default range до 2 |

---

## 5. ПОРЯДОК ВЫПОЛНЕНИЯ

```
ЧАС 1-2: CDEK
  1.1 Создать intake.ts, print.ts, webhooks.ts (восстановление из npm dist)
  1.2 Обновить calculate.ts (добавить calculate_tariff_list если нет)
  1.3 Обновить locations.ts (добавить get_regions если нет)
  1.4 Добавить list_orders в orders.ts
  1.5 Добавить delete_webhook в webhooks.ts
  1.6 Обновить index.ts (импорты + version + toolCount)
  1.7 tsc --noEmit → npm test → npm publish

ЧАС 3-4: TKASSA
  2.1 Создать customers.ts, sbp.ts, receipts.ts (восстановление)
  2.2 Добавить charge_payment в payments.ts
  2.3 Создать invest-client.ts
  2.4 Создать invest.ts (get_portfolio + find_instrument)
  2.5 Обновить index.ts (TOOL_COUNT=16, version=2.1.0)
  2.6 tsc --noEmit → npm test → npm publish

ЧАС 5-6: TRAVELPAYOUTS
  3.0 Заменить src/client.ts (dual base URL — секция 3.3)
  3.1 Принять npm 2.0.1 как базу (скопировать flights.ts, hotels.ts, lookup.ts)
  3.2 Добавить get_direct_routes + get_nearest_prices в flights.ts
  3.3 Обновить index.ts (13 tools, version=2.1.0)
  3.4 tsc --noEmit → npm test → npm publish
```

---

## 6. ЧЕКЛИСТ ГОТОВНОСТИ (каждый сервер)

```
[ ] tsc --noEmit — 0 ошибок
[ ] npm test — все зелёные
[ ] version: package.json = src/index.ts = smithery.yaml
[ ] toolCount в index.ts = реальное кол-во server.tool() вызовов
[ ] README обновлён (таблица инструментов)
[ ] npm publish прошёл (prepublishOnly: build + test)
[ ] npm view @theyahia/{name}-mcp version = ожидаемое
[ ] smoke test: node dist/index.js — правильный tool count в stderr
```

---

## 7. ИТОГОВЫЕ ВЕРСИИ ПОСЛЕ ИМПЛЕМЕНТАЦИИ

| Пакет | npm сейчас | Будет | Tools |
|-------|-----------|-------|-------|
| `@theyahia/cdek-mcp` | 2.0.2 | **2.1.0** | 14 → 16 |
| `@theyahia/tkassa-mcp` | 2.0.1 | **2.1.0** | 14 → 16 |
| `@theyahia/travelpayouts-mcp` | 2.0.1 | **2.1.0** | 11 → 13 |
