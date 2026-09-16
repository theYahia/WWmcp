/**
 * MCP Prompts — reusable workflow templates for common DaData tasks.
 *
 * These guide AI agents through multi-step validation workflows,
 * ensuring consistent and thorough results.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "check_counterparty",
    "Due diligence check on a Russian company by INN — verifies status, registration, and risks",
    { inn: z.string().describe("Company INN to check") },
    ({ inn }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Проведи проверку контрагента по ИНН ${inn}:

1. Используй find_company_by_id чтобы получить данные компании
2. Проверь статус: ACTIVE = ок, LIQUIDATING/BANKRUPT = красный флаг
3. Оцени дату регистрации (менее 1 года = повышенный риск)
4. Проверь наличие руководителя (пустое поле = подозрительно)
5. Если есть финансовые данные — оцени соотношение доходов/расходов
6. Выдай заключение: надёжный / требует внимания / высокий риск

Ответ на русском языке с обоснованием каждого пункта.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "validate_address",
    "Validate and standardize a Russian address with quality assessment",
    { address: z.string().describe("Address to validate") },
    ({ address }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Проверь и стандартизируй адрес: "${address}"

1. Используй suggest_address для поиска подходящих вариантов
2. Если нашёлся точный вариант — используй clean_address для полной стандартизации
3. Оцени качество по полям quality и geo_quality в ответе
4. Верни стандартизированный адрес с почтовым индексом, координатами и оценкой уверенности

Ответ на русском языке.`,
          },
        },
      ],
    }),
  );
}
