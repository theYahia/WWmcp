/**
 * Sberbank MCP server factory.
 * Отделена от index.ts, чтобы тесты импортировали фабрику без запуска runServer.
 */

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";

import { getAccountsSchema, handleGetAccounts, getBalanceSchema, handleGetBalance } from "./tools/accounts.js";
import {
  getStatementSchema,
  handleGetStatement,
  summarizeTransactionsSchema,
  handleSummarizeTransactions,
} from "./tools/transactions.js";
import {
  createPaymentSchema,
  handleCreatePayment,
  getPaymentStatusSchema,
  handleGetPaymentStatus,
} from "./tools/payments.js";
import { handleListCounterparties } from "./tools/counterparties.js";
import { handleGetCompanyInfo } from "./tools/company.js";

export const logger = createLogger("sber-mcp");

// Версия — single source of truth из package.json (работает и в dev через tsx, и в собранном dist).
export const VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  }
).version;

export const TOOL_COUNT = 8;

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "sber-mcp", version: VERSION });

  // === Счета ===

  server.registerTool(
    "get_accounts",
    {
      description: "Список счетов клиента в Сбербанке.",
      inputSchema: getAccountsSchema.shape,
      annotations: { title: "Список счетов", readOnlyHint: true },
    },
    withErrorHandling(async () => ({ content: [{ type: "text", text: await handleGetAccounts() }] })),
  );

  server.registerTool(
    "get_balance",
    {
      // Смоук ядра требует описание от 20 символов.
      description: "Баланс по счёту клиента в Сбербанке.",
      inputSchema: getBalanceSchema.shape,
      annotations: { title: "Баланс счёта", readOnlyHint: true },
    },
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetBalance(params) }],
    })),
  );

  // === Выписки ===

  server.registerTool(
    "get_statement",
    {
      description: "Выписка по счёту за период (список транзакций). Поддерживает пагинацию.",
      inputSchema: getStatementSchema.shape,
      annotations: { title: "Выписка по счёту", readOnlyHint: true },
    },
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStatement(params) }],
    })),
  );

  server.registerTool(
    "summarize_transactions",
    {
      description:
        "Сводка по выписке: количество, суммы поступлений/списаний, чистый итог за период.",
      inputSchema: summarizeTransactionsSchema.shape,
      annotations: { title: "Сводка по транзакциям", readOnlyHint: true },
    },
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSummarizeTransactions(params) }],
    })),
  );

  // === Платежи ===

  server.registerTool(
    "create_payment",
    {
      description:
        "Создание платёжного поручения. Денежная операция: идемпотентна по RqUID " +
        "(повтор с тем же ключом не создаёт дубль).",
      inputSchema: createPaymentSchema.shape,
      annotations: {
        title: "Создать платёж",
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreatePayment(params) }],
    })),
  );

  server.registerTool(
    "get_payment_status",
    {
      description: "Статус платежа по ID.",
      inputSchema: getPaymentStatusSchema.shape,
      annotations: { title: "Статус платежа", readOnlyHint: true },
    },
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPaymentStatus(params) }],
    })),
  );

  // === Контрагенты / Организация ===

  server.registerTool(
    "list_counterparties",
    {
      description: "Список сохранённых контрагентов (получателей платежей).",
      annotations: { title: "Контрагенты", readOnlyHint: true },
    },
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleListCounterparties() }],
    })),
  );

  server.registerTool(
    "get_company_info",
    {
      description: "Сведения об организации-клиенте (реквизиты, ИНН, список счетов).",
      annotations: { title: "Об организации", readOnlyHint: true },
    },
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleGetCompanyInfo() }],
    })),
  );

  return server;
}
