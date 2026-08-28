#!/usr/bin/env node

import { z } from "zod";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "./version.js";
import { toolStructured, toolText } from "./format.js";
import {
  listVacanciesSchema,
  listVacanciesOutput,
  handleListVacancies,
  getVacancySchema,
  handleGetVacancy,
} from "./tools/vacancies.js";
import {
  searchApplicantsSchema,
  searchApplicantsOutput,
  handleSearchApplicants,
  listVacancyApplicantsSchema,
  listVacancyApplicantsOutput,
  handleListVacancyApplicants,
  getApplicantSchema,
  handleGetApplicant,
} from "./tools/applicants.js";
import {
  getApplicantResumesSchema,
  getApplicantResumesOutput,
  handleGetApplicantResumes,
  getResumeSchema,
  handleGetResume,
} from "./tools/resumes.js";
import { listStagesSchema, listStagesOutput, handleListStages } from "./tools/stages.js";
import { listAccountsSchema, listAccountsOutput, handleListAccounts } from "./tools/accounts.js";
import {
  listCoworkersSchema,
  listCoworkersOutput,
  handleListCoworkers,
} from "./tools/coworkers.js";
import {
  dictSchema,
  dictOutput,
  handleListSources,
  handleListRejectionReasons,
  handleListDivisions,
  handleListTags,
} from "./tools/dictionaries.js";

const TOOL_COUNT = 14;
const PROMPT_COUNT = 2;

type AnyObject = z.ZodObject<z.ZodRawShape>;

function errorResult(e: unknown) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: e instanceof Error ? e.message : String(e) }],
  };
}

/** Регистрирует курируемый тул (с outputSchema → structuredContent). */
function registerStructured<S extends AnyObject>(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: S,
  outputSchema: z.ZodTypeAny,
  handler: (args: z.infer<S>) => Promise<unknown>,
): void {
  server.registerTool(
    name,
    { description, inputSchema: inputSchema.shape, outputSchema: outputSchema as never },
    async (args) => {
      try {
        return toolStructured(await handler(args as z.infer<S>));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}

/** Регистрирует тул, возвращающий полный (сырой) ответ как текст. */
function registerText<S extends AnyObject>(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: S,
  handler: (args: z.infer<S>) => Promise<unknown>,
): void {
  server.registerTool(name, { description, inputSchema: inputSchema.shape }, async (args) => {
    try {
      return toolText(await handler(args as z.infer<S>));
    } catch (e) {
      return errorResult(e);
    }
  });
}

export function createServer(): McpServer {
  const server = new McpServer({ name: "huntflow-mcp", version: VERSION });

  // --- Списки (курируемый structuredContent) ---
  registerStructured(
    server,
    "list_accounts",
    "Список доступных аккаунтов HuntFlow.",
    listAccountsSchema,
    listAccountsOutput,
    handleListAccounts,
  );

  registerStructured(
    server,
    "list_vacancies",
    "Список вакансий в HuntFlow (по умолчанию открытые).",
    listVacanciesSchema,
    listVacanciesOutput,
    handleListVacancies,
  );

  registerStructured(
    server,
    "search_applicants",
    "Поиск кандидатов по имени/email/телефону и фильтрам (вакансия, этап, тег).",
    searchApplicantsSchema,
    searchApplicantsOutput,
    handleSearchApplicants,
  );

  registerStructured(
    server,
    "list_vacancy_applicants",
    "Кандидаты, прикреплённые к конкретной вакансии.",
    listVacancyApplicantsSchema,
    listVacancyApplicantsOutput,
    handleListVacancyApplicants,
  );

  registerStructured(
    server,
    "get_applicant_resumes",
    "Резюме кандидата (все прикреплённые external).",
    getApplicantResumesSchema,
    getApplicantResumesOutput,
    handleGetApplicantResumes,
  );

  registerStructured(
    server,
    "list_stages",
    "Этапы воронки подбора (статусы вакансий).",
    listStagesSchema,
    listStagesOutput,
    handleListStages,
  );

  registerStructured(
    server,
    "list_coworkers",
    "Сотрудники/рекрутеры аккаунта.",
    listCoworkersSchema,
    listCoworkersOutput,
    handleListCoworkers,
  );

  registerStructured(
    server,
    "list_sources",
    "Справочник источников кандидатов.",
    dictSchema,
    dictOutput,
    handleListSources,
  );

  registerStructured(
    server,
    "list_rejection_reasons",
    "Справочник причин отказа.",
    dictSchema,
    dictOutput,
    handleListRejectionReasons,
  );

  registerStructured(
    server,
    "list_divisions",
    "Справочник подразделений (отделов).",
    dictSchema,
    dictOutput,
    handleListDivisions,
  );

  registerStructured(
    server,
    "list_tags",
    "Справочник тегов аккаунта.",
    dictSchema,
    dictOutput,
    handleListTags,
  );

  // --- Полные карточки (сырой ответ) ---
  registerText(
    server,
    "get_vacancy",
    "Полная информация о вакансии.",
    getVacancySchema,
    handleGetVacancy,
  );

  registerText(
    server,
    "get_applicant",
    "Полная информация о кандидате.",
    getApplicantSchema,
    handleGetApplicant,
  );

  registerText(
    server,
    "get_resume",
    "Полное тело конкретного резюме (external) кандидата.",
    getResumeSchema,
    handleGetResume,
  );

  // --- Скиллы / Prompts ---
  server.registerPrompt(
    "skill-applicants",
    {
      description:
        "Кандидаты на вакансию — показать всех кандидатов, прикреплённых к указанной вакансии.",
      argsSchema: {
        account_id: z.string().describe("ID аккаунта"),
        vacancy_id: z.string().describe("ID вакансии"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Покажи всех кандидатов на вакансию ${args.vacancy_id} в аккаунте ${args.account_id}.`,
              `Шаги: (1) list_stages(account_id=${args.account_id}) — получить расшифровку этапов;`,
              `(2) list_vacancy_applicants(account_id=${args.account_id}, vacancy_id=${args.vacancy_id}) — кандидаты вакансии.`,
              `Для каждого кандидата покажи: имя, email, телефон, текущий этап (сопоставь status id с list_stages).`,
              `Формат: таблица. В конце — сводка: сколько всего и сколько на каждом этапе.`,
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "skill-vacancy-stats",
    {
      description: "Статистика по вакансии — воронка, сроки, конверсия.",
      argsSchema: {
        account_id: z.string().describe("ID аккаунта"),
        vacancy_id: z.string().describe("ID вакансии"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Покажи статистику по вакансии ${args.vacancy_id} в аккаунте ${args.account_id}.`,
              `Используй: get_vacancy, list_stages, list_vacancy_applicants.`,
              `Собери: название вакансии, дата создания, сколько дней открыта,`,
              `количество кандидатов на каждом этапе воронки, общая конверсия.`,
              `Формат: сначала карточка вакансии, потом воронка (этап → кол-во), потом выводы.`,
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
}

async function startHttp(server: McpServer): Promise<void> {
  const { StreamableHTTPServerTransport } =
    await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const http = await import("node:http");

  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HUNTFLOW_HTTP_HOST || "127.0.0.1";
  const SECRET = process.env.HUNTFLOW_HTTP_SECRET;
  const allowedHosts = (process.env.HUNTFLOW_ALLOWED_HOSTS || `127.0.0.1:${PORT},localhost:${PORT}`)
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableDnsRebindingProtection: true,
    allowedHosts,
  });

  await server.connect(transport);

  const httpServer = http.createServer(async (req, res) => {
    if (req.url === "/mcp") {
      // Опциональная защита эндпоинта общим секретом.
      if (SECRET && req.headers["authorization"] !== `Bearer ${SECRET}`) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      await transport.handleRequest(req, res);
    } else if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          version: VERSION,
          tools: TOOL_COUNT,
          prompts: PROMPT_COUNT,
        }),
      );
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  httpServer.listen(PORT, HOST, () => {
    console.error(
      `[huntflow-mcp] HTTP сервер на http://${HOST}:${PORT}. POST /mcp, GET /health` +
        (SECRET ? " (защищён HUNTFLOW_HTTP_SECRET)" : ""),
    );
  });
}

async function main() {
  const server = createServer();

  if (process.argv.slice(2).includes("--http")) {
    await startHttp(server);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      `[huntflow-mcp] Сервер запущен (stdio). ${TOOL_COUNT} инструментов, ${PROMPT_COUNT} скилла.`,
    );
  }
}

// Запуск только при прямом вызове (не при импорте из тестов).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error("[huntflow-mcp] Ошибка:", error);
    process.exit(1);
  });
}
