/**
 * @theyahia/cdek-mcp — MCP server factory for the CDEK delivery API.
 *
 * `createServer()` is a pure factory with no side effects on import, so it can
 * be imported by tests. The runtime entry point lives in `index.ts`.
 *
 * 16 tools: calculate_tariff, calculate_tariff_list, create_order, get_order,
 * delete_order, list_orders, track_shipment, list_delivery_points, get_cities,
 * get_regions, generate_barcode, create_courier_pickup, get_courier_pickup,
 * print_receipt, create_webhook, delete_webhook.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import {
  calculateTariffSchema, handleCalculateTariff,
  calculateTariffListSchema, handleCalculateTariffList,
} from "./tools/calculate.js";
import {
  getCitiesSchema, handleGetCities,
  listDeliveryPointsSchema, handleListDeliveryPoints,
  getRegionsSchema, handleGetRegions,
} from "./tools/locations.js";
import {
  createOrderSchema, handleCreateOrder,
  getOrderSchema, handleGetOrder,
  deleteOrderSchema, handleDeleteOrder,
  listOrdersSchema, handleListOrders,
} from "./tools/orders.js";
import { trackShipmentSchema, handleTrackShipment } from "./tools/tracking.js";
import { generateBarcodeSchema, handleGenerateBarcode } from "./tools/barcode.js";
import {
  createIntakeSchema, handleCreateIntake,
  getIntakeSchema, handleGetIntake,
} from "./tools/intake.js";
import { printReceiptSchema, handlePrintReceipt } from "./tools/print.js";
import {
  createWebhookSchema, handleCreateWebhook,
  deleteWebhookSchema, handleDeleteWebhook,
} from "./tools/webhooks.js";

/** Server identity — single source of truth, also consumed by index.ts and tests. */
export const SERVER_NAME = "cdek-mcp";
export const SERVER_VERSION = "2.2.0";
export const TOOL_COUNT = 16;

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.tool(
    "calculate_tariff",
    "Расчёт стоимости и сроков доставки СДЭК по конкретному тарифу, маршруту и параметрам груза. Используйте для предварительной оценки перед созданием заказа. Требует код тарифа (136=склад-склад, 137=склад-дверь, 138=дверь-склад, 139=дверь-дверь). Для поиска кода города используйте get_cities.",
    calculateTariffSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCalculateTariff(params) }],
    })),
  );

  server.tool(
    "calculate_tariff_list",
    "Расчёт стоимости доставки СДЭК по всем доступным тарифам для маршрута. Используйте когда нужно показать клиенту все варианты доставки с ценами и сроками, не зная заранее код тарифа.",
    calculateTariffListSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCalculateTariffList(params) }],
    })),
  );

  server.tool(
    "create_order",
    "Создание заказа на доставку СДЭК с указанием отправителя, получателя и мест. Перед созданием рекомендуется рассчитать стоимость через calculate_tariff. После создания заказ можно отслеживать через get_order или track_shipment.",
    createOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateOrder(params) }],
    })),
  );

  server.tool(
    "get_order",
    "Получение полной информации о заказе СДЭК по UUID. Возвращает статусы, номер накладной и детали доставки. Используйте после create_order для проверки обработки заказа.",
    getOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrder(params) }],
    })),
  );

  server.tool(
    "delete_order",
    "Удаление заказа СДЭК по UUID. Работает только для заказов, ещё не переданных в курьерскую службу. После удаления заказ нельзя восстановить.",
    deleteOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleDeleteOrder(params) }],
    })),
  );

  server.tool(
    "list_orders",
    "Поиск и фильтрация заказов СДЭК по дате, номеру ИМ или накладной СДЭК. Поддерживает пагинацию. Используйте для получения списка заказов за период или поиска конкретного заказа.",
    listOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListOrders(params) }],
    })),
  );

  server.tool(
    "track_shipment",
    "Отслеживание отправления СДЭК по номеру накладной (cdek_number). Возвращает полную историю статусов с датами и городами. Если известен только UUID заказа — используйте get_order.",
    trackShipmentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleTrackShipment(params) }],
    })),
  );

  server.tool(
    "list_delivery_points",
    "Поиск пунктов выдачи (ПВЗ) и постаматов СДЭК по городу, индексу или GPS-координатам. При указании latitude+longitude+radius_km фильтрует и сортирует пункты по расстоянию. Возвращает адрес, время работы, наличие примерочной и способы оплаты.",
    listDeliveryPointsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListDeliveryPoints(params) }],
    })),
  );

  server.tool(
    "get_cities",
    "Поиск городов в справочнике СДЭК по названию, индексу или стране. Возвращает код города, регион и ФИАС. Используйте для получения city_code перед вызовом calculate_tariff или create_order.",
    getCitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCities(params) }],
    })),
  );

  server.tool(
    "get_regions",
    "Получение справочника регионов СДЭК. Поддерживает фильтрацию по стране и названию региона, пагинацию. Используйте для построения иерархии локаций или фильтрации городов по региону.",
    getRegionsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetRegions(params) }],
    })),
  );

  server.tool(
    "generate_barcode",
    "Генерация штрихкода (этикетки) для заказа СДЭК по UUID. Поддерживает форматы A4, A5, A6 и до 10 копий. Ссылка на PDF появится в результатах get_order.",
    generateBarcodeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGenerateBarcode(params) }],
    })),
  );

  server.tool(
    "create_courier_pickup",
    "Создание заявки на вызов курьера СДЭК для забора отправления. Требует UUID заказа и временной интервал. После создания можно отслеживать статус заявки через get_courier_pickup.",
    createIntakeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateIntake(params) }],
    })),
  );

  server.tool(
    "get_courier_pickup",
    "Получение статуса заявки на вызов курьера СДЭК по UUID заявки. Возвращает дату, время и историю статусов заявки.",
    getIntakeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetIntake(params) }],
    })),
  );

  server.tool(
    "print_receipt",
    "Печать квитанции (накладной) для заказа СДЭК в формате PDF. Опрашивает API до готовности файла (до 10 секунд) и возвращает ссылку для скачивания.",
    printReceiptSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handlePrintReceipt(params) }],
    })),
  );

  server.tool(
    "create_webhook",
    "Подписка на вебхуки СДЭК для получения уведомлений о смене статуса заказов (ORDER_STATUS) или готовности фото (DOWNLOAD_PHOTO). СДЭК будет отправлять POST-запросы на указанный HTTPS URL.",
    createWebhookSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateWebhook(params) }],
    })),
  );

  server.tool(
    "delete_webhook",
    "Удаление подписки на вебхуки СДЭК по UUID вебхука. Используйте для отключения уведомлений или смены URL получателя (удалить старый + создать новый).",
    deleteWebhookSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleDeleteWebhook(params) }],
    })),
  );

  return server;
}
