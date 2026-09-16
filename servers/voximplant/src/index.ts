#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runServer, withErrorHandling } from "@theyahia/mcp-core";

import { VERSION, assertCredentials, loadDotenv, logger } from "./config.js";
import { registerCallTools } from "./tools/calls.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerScenarioTools } from "./tools/scenarios.js";
import { registerRuleTools } from "./tools/rules.js";
import { registerCallManagementTools } from "./tools/calls-management.js";
import { registerRecordingTools } from "./tools/recordings.js";
import { registerObservabilityTools } from "./tools/observability.js";
import { registerA2pTools } from "./tools/a2p.js";
import { skillCallHistory } from "./skills/call-history.js";
import { skillAccountInfo } from "./skills/account-info.js";

// listTools() отдаёт и скиллы: 21 инструмент API + 2 скилла
const TOOL_COUNT = 23;

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "voximplant-mcp", version: VERSION });

  // 21 инструмента, сгруппированных по доменам
  registerCallTools(server);            // get_call_history, get_users, send_sms
  registerAccountTools(server);         // get_account_info
  registerCallManagementTools(server);  // start_call, get_acd_state, get_sms_history
  registerRecordingTools(server);       // get_recordings
  registerScenarioTools(server);        // get_scenarios, update_scenario
  registerRuleTools(server);            // get_rules
  registerObservabilityTools(server);   // phone_numbers, applications, queues, skills, sq_state, caller_ids, record_storages, transaction_history
  registerA2pTools(server);             // get_a2p_sms_history, send_a2p_sms (guarded)

  // 2 skills (зарегистрированы как tools без параметров)
  server.tool(skillCallHistory.name, skillCallHistory.description, {}, withErrorHandling(() => skillCallHistory.run()));
  server.tool(skillAccountInfo.name, skillAccountInfo.description, {}, withErrorHandling(() => skillAccountInfo.run()));

  return server;
}

async function main(): Promise<void> {
  loadDotenv();
  assertCredentials();

  // Совместимость с 2.0.0: README документирует порт HTTP-режима через PORT, ядро читает HTTP_PORT.
  // Только при явном --http: PORT, выставленный хостингом, не должен переключать stdio в HTTP.
  if (process.argv.includes("--http") && process.env.PORT && !process.env.HTTP_PORT) {
    process.env.HTTP_PORT = process.env.PORT;
  }

  await runServer(createMcpServer, {
    name: "voximplant-mcp",
    version: VERSION,
    toolCount: TOOL_COUNT,
    logger,
  });
}

export { createMcpServer };

main().catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
