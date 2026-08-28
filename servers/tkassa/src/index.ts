#!/usr/bin/env node

/**
 * @theyahia/tkassa-mcp — MCP server for T-Kassa (T-Bank/Tinkoff) payment API
 *
 * 16 tools: init_payment, get_payment_state, confirm_payment, cancel_payment,
 * charge_payment, refund_payment, add_customer, get_customer, remove_customer,
 * get_card_list, remove_card, create_sbp_qr, get_sbp_qr_state,
 * send_closing_receipt, get_invest_portfolio, find_instrument.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  initPaymentSchema, handleInitPayment,
  getStateSchema, handleGetState,
  confirmSchema, handleConfirm,
  cancelSchema, handleCancel,
  chargeSchema, handleCharge,
} from "./tools/payments.js";
import { cancelPaymentSchema, handleCancelPayment } from "./tools/refunds.js";
import {
  addCustomerSchema, handleAddCustomer,
  getCustomerSchema, handleGetCustomer,
  removeCustomerSchema, handleRemoveCustomer,
  getCardListSchema, handleGetCardList,
  removeCardSchema, handleRemoveCard,
} from "./tools/customers.js";
import {
  createSbpQrSchema, handleCreateSbpQr,
  getSbpQrStateSchema, handleGetSbpQrState,
} from "./tools/sbp.js";
import { sendClosingReceiptSchema, handleSendClosingReceipt } from "./tools/receipts.js";
import {
  getPortfolioSchema, handleGetPortfolio,
  findInstrumentSchema, handleFindInstrument,
} from "./tools/invest.js";

const logger = createLogger("tkassa-mcp");

export const TOOL_COUNT = 16;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "tkassa-mcp",
    version: "2.0.1",
  });

  server.tool(
    "init_payment",
    "Инициализация платежа в T-Kassa и получение PaymentURL для оплаты. Сумма указывается в рублях. Поддерживает рекуррентные платежи, custom URL уведомлений и редиректов.",
    initPaymentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleInitPayment(params) }],
    })),
  );

  server.tool(
    "get_payment_state",
    "Получение текущего статуса платежа по PaymentId. Возвращает статус, сумму, OrderId и детали ошибки. Используйте для отслеживания платежа после инициализации.",
    getStateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetState(params) }],
    })),
  );

  server.tool(
    "confirm_payment",
    "Подтверждение двухстадийного платежа T-Kassa для списания удержанных средств. Можно подтвердить частичную сумму (меньше авторизованной). Сумма в рублях.",
    confirmSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleConfirm(params) }],
    })),
  );

  server.tool(
    "cancel_payment",
    "Отмена платежа T-Kassa до или после подтверждения. Поддерживает частичную отмену. Для возврата после списания используйте refund_payment.",
    cancelSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCancel(params) }],
    })),
  );

  server.tool(
    "charge_payment",
    "Рекуррентный платёж (автоплатёж) по привязанной карте через RebillId. Используйте для подписок и автоматических списаний. Требует предварительного платежа с Recurrent=Y.",
    chargeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCharge(params) }],
    })),
  );

  server.tool(
    "refund_payment",
    "Возврат платежа T-Kassa — полный или частичный. Если сумма не указана — полный возврат. Используется после успешного списания (в отличие от cancel_payment).",
    cancelPaymentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCancelPayment(params) }],
    })),
  );

  server.tool(
    "add_customer",
    "Регистрация покупателя в T-Kassa для привязки карт и рекуррентных платежей. CustomerKey — уникальный ID в вашей системе.",
    addCustomerSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleAddCustomer(params) }],
    })),
  );

  server.tool(
    "get_customer",
    "Получение информации о покупателе T-Kassa по CustomerKey.",
    getCustomerSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCustomer(params) }],
    })),
  );

  server.tool(
    "remove_customer",
    "Удаление покупателя из T-Kassa и всех его привязанных карт по CustomerKey.",
    removeCustomerSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRemoveCustomer(params) }],
    })),
  );

  server.tool(
    "get_card_list",
    "Получение списка привязанных карт покупателя T-Kassa. Возвращает CardId и маскированные номера карт для рекуррентных платежей.",
    getCardListSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCardList(params) }],
    })),
  );

  server.tool(
    "remove_card",
    "Удаление привязанной карты покупателя T-Kassa по CardId. Используйте get_card_list для получения списка карт.",
    removeCardSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRemoveCard(params) }],
    })),
  );

  server.tool(
    "create_sbp_qr",
    "Создание QR-кода СБП для оплаты через Систему Быстрых Платежей. Поддерживает PAYLOAD (ссылка) и IMAGE (base64 PNG). Требует предварительной инициализации платежа.",
    createSbpQrSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateSbpQr(params) }],
    })),
  );

  server.tool(
    "get_sbp_qr_state",
    "Проверка статуса оплаты по QR-коду СБП. Используйте для polling после создания QR-кода через create_sbp_qr.",
    getSbpQrStateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetSbpQrState(params) }],
    })),
  );

  server.tool(
    "send_closing_receipt",
    "Отправка закрывающего чека в ФНС через T-Kassa (54-ФЗ). Используйте при фактической отгрузке товара после оплаты. Требует список позиций с НДС и систему налогообложения.",
    sendClosingReceiptSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendClosingReceipt(params) }],
    })),
  );

  server.tool(
    "get_invest_portfolio",
    "Получение портфеля инвестиций T-Invest: акции, облигации, ETF, их стоимость и P&L. Требует TINKOFF_INVEST_TOKEN в переменных окружения.",
    getPortfolioSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPortfolio(params) }],
    })),
  );

  server.tool(
    "find_instrument",
    "Поиск торгового инструмента T-Invest по тикеру, ISIN или названию компании. Возвращает FIGI — ключ инструмента в системе T-Invest. Требует TINKOFF_INVEST_TOKEN.",
    findInstrumentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleFindInstrument(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "tkassa-mcp",
  version: "2.0.1",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
