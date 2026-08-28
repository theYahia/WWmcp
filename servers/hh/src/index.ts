#!/usr/bin/env node

import http from "node:http";
import type { ZodRawShape } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { VERSION } from "./version.js";
import {
  searchVacanciesSchema,
  handleSearchVacancies,
  getVacancySchema,
  handleGetVacancy,
  getSimilarVacanciesSchema,
  handleGetSimilarVacancies,
} from "./tools/vacancies.js";
import {
  searchEmployersSchema,
  handleSearchEmployers,
  getEmployerSchema,
  handleGetEmployer,
  getEmployerVacanciesSchema,
  handleGetEmployerVacancies,
} from "./tools/employers.js";
import {
  searchResumesSchema,
  handleSearchResumes,
  getResumeSchema,
  handleGetResume,
} from "./tools/resumes.js";
import {
  getAreasSchema,
  handleGetAreas,
  getAreasSubtreeSchema,
  handleGetAreasSubtree,
  getProfessionalRolesSchema,
  handleGetProfessionalRoles,
  getIndustriesSchema,
  handleGetIndustries,
  getMetroSchema,
  handleGetMetro,
  handleGetDictionaries,
  validateTokenSchema,
  handleValidateToken,
  suggestPositionsSchema,
  handleSuggestPositions,
  suggestCompaniesSchema,
  handleSuggestCompanies,
  suggestAreasSchema,
  handleSuggestAreas,
} from "./tools/references.js";
import {
  getSalaryStatisticsSchema,
  handleGetSalaryStatistics,
} from "./tools/salary.js";

// Tool handlers return a plain string; core's withErrorHandling wraps it into an
// MCP CallToolResult and adds, for free: error categorisation with a next-action
// hint (isError: true, so the LLM can self-correct), prompt-injection stripping
// and 50k truncation of the API text before it reaches the model. hh.ru
// vacancy/resume bodies are employer-authored free text — an injection surface.
function wrapHandler(fn: (params: any) => Promise<string>) {
  return withErrorHandling(async (params: any) => ({
    content: [{ type: "text" as const, text: await fn(params) }],
  }));
}

interface ToolDef {
  name: string;
  description: string;
  schema: ZodRawShape;
  handler: (params: any) => Promise<string>;
}

// Declarative tool registry — TOOL_COUNT is derived from it so it can never
// drift from the actual number of registered tools.
const TOOLS: ToolDef[] = [
  // --- Vacancies ---
  {
    name: "search_vacancies",
    description:
      "Search job vacancies on hh.ru by keywords, region, professional role, industry, metro, salary, experience, employment form, work format, date range and labels. Returns a compact paginated summary (pass raw:true for full JSON).",
    schema: searchVacanciesSchema.shape,
    handler: handleSearchVacancies,
  },
  {
    name: "get_vacancy",
    description:
      "Get full vacancy details: description, requirements, key skills, contacts, employer info.",
    schema: getVacancySchema.shape,
    handler: handleGetVacancy,
  },
  {
    name: "get_similar_vacancies",
    description:
      "Find vacancies similar to a given one. Useful for expanding a candidate's job search.",
    schema: getSimilarVacanciesSchema.shape,
    handler: handleGetSimilarVacancies,
  },
  // --- Resumes (require an employer token + paid resume-database access) ---
  {
    name: "search_resumes",
    description:
      "Search candidate resumes by keywords, region, professional role, salary, experience. Requires an EMPLOYER OAuth token (HH_ACCESS_TOKEN) AND a paid hh.ru resume-database subscription — applicant/anonymous tokens get 403.",
    schema: searchResumesSchema.shape,
    handler: handleSearchResumes,
  },
  {
    name: "get_resume",
    description:
      "Get full resume details: experience, education, skills, contacts. Requires an EMPLOYER OAuth token + paid resume-database access.",
    schema: getResumeSchema.shape,
    handler: handleGetResume,
  },
  // --- Employers ---
  {
    name: "search_employers",
    description:
      "Search companies/employers on hh.ru by name. Returns company info and open vacancy count.",
    schema: searchEmployersSchema.shape,
    handler: handleSearchEmployers,
  },
  {
    name: "get_employer",
    description:
      "Get detailed employer profile: description, industries, website, vacancy count.",
    schema: getEmployerSchema.shape,
    handler: handleGetEmployer,
  },
  {
    name: "get_employer_vacancies",
    description: "List active vacancies for a specific employer.",
    schema: getEmployerVacanciesSchema.shape,
    handler: handleGetEmployerVacancies,
  },
  // --- Dictionaries & Suggests ---
  {
    name: "get_areas",
    description:
      "Get the full tree of regions and cities as `id — name` lines (pass raw:true for nested JSON). Use to find area IDs for search filters.",
    schema: getAreasSchema.shape,
    handler: handleGetAreas,
  },
  {
    name: "get_areas_subtree",
    description:
      "Get the regions/cities subtree under one area id (e.g. 113=Russia) — lighter than the full /areas tree.",
    schema: getAreasSubtreeSchema.shape,
    handler: handleGetAreasSubtree,
  },
  {
    name: "get_professional_roles",
    description:
      "Get the tree of professional roles with IDs. Use to find role IDs for vacancy/resume search and salary stats.",
    schema: getProfessionalRolesSchema.shape,
    handler: handleGetProfessionalRoles,
  },
  {
    name: "get_industries",
    description:
      "Get the tree of company industries with IDs. Use to find industry IDs for the search_vacancies `industry` filter.",
    schema: getIndustriesSchema.shape,
    handler: handleGetIndustries,
  },
  {
    name: "get_metro",
    description:
      "Get metro stations and lines with IDs for a city (city_id), or for all cities. Use to find metro IDs for the search_vacancies `metro` filter.",
    schema: getMetroSchema.shape,
    handler: handleGetMetro,
  },
  {
    name: "get_dictionaries",
    description:
      "Get all reference dictionaries: currencies, employment types, schedules, experience levels, vacancy labels, and more.",
    schema: {},
    handler: handleGetDictionaries,
  },
  {
    name: "validate_token",
    description:
      "Check whether HH_ACCESS_TOKEN is valid via /me and report the user role (applicant/employer). Use to diagnose resume-search access.",
    schema: validateTokenSchema.shape,
    handler: handleValidateToken,
  },
  {
    name: "suggest_positions",
    description:
      "Autocomplete job titles / professional roles. Returns matching role suggestions for partial input.",
    schema: suggestPositionsSchema.shape,
    handler: handleSuggestPositions,
  },
  {
    name: "suggest_companies",
    description:
      "Autocomplete company names. Returns matching employer suggestions for partial input.",
    schema: suggestCompaniesSchema.shape,
    handler: handleSuggestCompanies,
  },
  {
    name: "suggest_areas",
    description:
      "Autocomplete region/city names. Returns matching area suggestions for partial input.",
    schema: suggestAreasSchema.shape,
    handler: handleSuggestAreas,
  },
  // --- Salary ---
  {
    name: "get_salary_statistics",
    description:
      "Estimate salary distribution (median, P25/P75, min/max) for a professional role in a region by sampling posted vacancy salaries client-side. Biased sample (only vacancies that disclose salary) — not official market data.",
    schema: getSalaryStatisticsSchema.shape,
    handler: handleGetSalaryStatistics,
  },
];

export const TOOL_COUNT = TOOLS.length;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "hh-mcp",
    version: VERSION,
  });
  for (const tool of TOOLS) {
    server.tool(tool.name, tool.description, tool.schema, wrapHandler(tool.handler));
  }
  return server;
}

// --- HTTP body reader (stateless transport needs the parsed body) ---

const MAX_BODY = 4 * 1024 * 1024;

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// --- Start ---

async function main() {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http") || !!process.env.HTTP_PORT;
  const port = Number(process.env.HTTP_PORT || process.env.PORT || 3000);

  if (httpMode) {
    const host = process.env.HOST || "127.0.0.1";
    // DNS-rebinding protection (off by default in the SDK, CVE-2025-66414):
    // only accept requests whose Host header is in this allow-list.
    const allowedHosts = (
      process.env.HH_ALLOWED_HOSTS ||
      `127.0.0.1:${port},localhost:${port}`
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedOrigins = process.env.HH_ALLOWED_ORIGINS
      ? process.env.HH_ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);

      if (req.method === "GET" && url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT, version: VERSION }));
        return;
      }

      if (url.pathname === "/mcp") {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json", Allow: "POST" });
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: { code: -32000, message: "Method not allowed. Use POST /mcp." },
              id: null,
            }),
          );
          return;
        }
        // Stateless: a fresh server + transport per request avoids the
        // single-shared-transport concurrency bug. Torn down on response close.
        const server = createServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableDnsRebindingProtection: true,
          allowedHosts,
          ...(allowedOrigins ? { allowedOrigins } : {}),
        });
        res.on("close", () => {
          transport.close();
          server.close();
        });
        try {
          await server.connect(transport);
          const body = await readJsonBody(req);
          await transport.handleRequest(req, res, body);
        } catch (err) {
          console.error("[hh-mcp] request error:", err);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Internal server error" },
                id: null,
              }),
            );
          }
        }
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found. Use POST /mcp for the MCP protocol or GET /health for a health check.");
    });

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`[hh-mcp] Port ${port} is already in use. Set HTTP_PORT/PORT to a free port.`);
      } else {
        console.error("[hh-mcp] HTTP server error:", err);
      }
      process.exit(1);
    });

    httpServer.listen(port, host, () => {
      console.error(
        `[hh-mcp] HTTP mode on ${host}:${port} (${TOOL_COUNT} tools). Endpoint: POST /mcp, health: GET /health`,
      );
    });

    const shutdown = () => httpServer.close(() => process.exit(0));
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      `[hh-mcp] Server started (stdio). ${TOOL_COUNT} tools. Auth: ${process.env.HH_ACCESS_TOKEN ? "token set" : "no token (public endpoints only)"}`,
    );
  }
}

main().catch((error) => {
  console.error("[hh-mcp] Fatal error:", error);
  process.exit(1);
});
