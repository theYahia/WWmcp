/**
 * Truck tools: list_my_trucks, get_truck.
 *
 * IMPORTANT: ATI.su has NO public "search other companies' trucks" endpoint.
 * /v1.1/trucks manages YOUR OWN fleet only. These tools are read-only views of it.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { request } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { Truck, TrucksResponse } from "../types.js";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;

// TODO(verify): the full truck object schema is not in the public OpenAPI (only
// counter-offers are documented). We surface trucks as-is (passthrough).
const truckShape = z.record(z.string(), z.unknown());

function asTruckArray(data: TrucksResponse | null): Truck[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.trucks) ? data.trucks : [];
}

export function registerTruckTools(server: McpServer): void {
  server.registerTool(
    "list_my_trucks",
    {
      title: "List my trucks",
      description:
        "List the vehicles in YOUR OWN ATI.su fleet. ATI does not allow searching other " +
        "companies' trucks — this only returns your own registered vehicles.",
      inputSchema: {
        limit: z.number().int().min(1).max(200).default(50).describe("Max trucks to return"),
      },
      outputSchema: { total: z.number().optional(), trucks: z.array(truckShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ limit }) => {
      const result = await request<TrucksResponse>("/v1.1/trucks");
      if (result.error) return error(result.error);
      const trucks = asTruckArray(result.data);
      return success({
        total: trucks.length,
        trucks: trucks.slice(0, limit) as Record<string, unknown>[],
      });
    }),
  );

  server.registerTool(
    "get_truck",
    {
      title: "Get one of my trucks",
      description: "Get a single vehicle from YOUR OWN ATI.su fleet by its id.",
      inputSchema: {
        truck_id: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[A-Za-z0-9_-]+$/, "Truck id must be alphanumeric")
          .describe("ATI.su truck id (uuid)"),
      },
      outputSchema: { truck: truckShape.optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ truck_id }) => {
      const result = await request<Truck>(`/v1.1/trucks/${truck_id}`);
      if (result.error) return error(result.error);
      const truck = result.data as Truck | null;
      if (!truck || Object.keys(truck).length === 0) {
        return error(`Truck ${truck_id} not found or returned an unexpected shape.`);
      }
      return success({ truck: truck as Record<string, unknown> });
    }),
  );
}
