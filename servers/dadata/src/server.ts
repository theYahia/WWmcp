/**
 * DaData MCP server factory.
 *
 * 31 tools, 2 resources, 2 prompts. A factory (not a module-level server)
 * because the HTTP transport of @theyahia/mcp-core creates one server per session.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "@theyahia/mcp-core";

import { registerSuggestTools } from "./tools/suggest.js";
import { registerFindTools } from "./tools/find.js";
import { registerCleanTools } from "./tools/clean.js";
import { registerGeoTools } from "./tools/geo.js";
import { registerProfileTools } from "./tools/profile.js";
import { registerPassportTools } from "./tools/passport.js";
import { registerCompanyExtraTools } from "./tools/company-extra.js";
import { registerEmailExtraTools } from "./tools/email-extra.js";
import { registerVehicleTools } from "./tools/vehicle.js";
import { registerPostalTools } from "./tools/postal.js";
import { registerReferenceTools } from "./tools/reference.js";
import { registerResources } from "./resources/reference.js";
import { registerPrompts } from "./prompts/workflows.js";

export const logger = createLogger("dadata-mcp");

export const SERVER_NAME = "dadata-mcp";
export const VERSION = "1.0.6";
export const TOOL_COUNT = 31;

export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: VERSION });

  // Core tools (14)
  registerSuggestTools(server);       // suggest_address, suggest_company, suggest_fio
  registerFindTools(server);          // find_company_by_id, find_bank, find_by_id_address, find_delivery_city
  registerCleanTools(server);         // clean_address, clean_phone, clean_email, clean_name, clean_person
  registerGeoTools(server);           // geolocate_address, ip_locate
  registerProfileTools(server);       // get_balance, get_versions

  // Passport (3)
  registerPassportTools(server);      // clean_passport, find_fms_unit, find_inn_by_passport

  // Company extra (6)
  registerCompanyExtraTools(server);  // find_affiliated, find_company_by_email, find_brand, find_self_employed, suggest_company_by, suggest_company_kz

  // Email extra (1)
  registerEmailExtraTools(server);    // suggest_email

  // Vehicle (2)
  registerVehicleTools(server);       // clean_vehicle, suggest_car_brand

  // Postal & countries (2)
  registerPostalTools(server);        // find_postal_unit, suggest_country

  // Reference directories (1 tool covering 12 directories)
  registerReferenceTools(server);     // lookup_reference

  // Resources (2): quality-codes, capabilities
  registerResources(server);

  // Prompts (2): check_counterparty, validate_address
  registerPrompts(server);

  return server;
}
