/**
 * Shared E2E smoke test utilities for MCP servers.
 *
 * Uses StdioClientTransport from the MCP SDK to connect to a compiled
 * server binary and verify it starts, lists tools, and has quality descriptions.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface SmokeTestConfig {
  /** Path to the compiled server entry point (e.g., "dist/index.js") */
  serverPath: string;
  /** Expected minimum number of tools */
  expectedToolCount: number;
  /** Environment variables to pass to the server process */
  env?: Record<string, string>;
  /** Timeout in ms (default: 10_000) */
  timeout?: number;
}

export interface SmokeTestResult {
  connected: boolean;
  toolCount: number;
  tools: Array<{
    name: string;
    description: string;
    descriptionLength: number;
    hasInputSchema: boolean;
  }>;
  errors: string[];
}

/**
 * Runs a smoke test against a compiled MCP server.
 *
 * 1. Spawns the server via StdioClientTransport
 * 2. Connects and sends initialize
 * 3. Lists tools and validates descriptions
 * 4. Closes cleanly
 */
export async function runSmokeTest(
  config: SmokeTestConfig,
): Promise<SmokeTestResult> {
  const errors: string[] = [];
  const timeout = config.timeout ?? 10_000;

  const transport = new StdioClientTransport({
    command: "node",
    args: [config.serverPath],
    env: {
      ...process.env,
      ...config.env,
    } as Record<string, string>,
  });

  const client = new Client({
    name: "smoke-test",
    version: "1.0.0",
  });

  try {
    // Connect with timeout
    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), timeout),
      ),
    ]);

    const { tools } = await client.listTools();

    if (tools.length < config.expectedToolCount) {
      errors.push(
        `Expected at least ${config.expectedToolCount} tools, got ${tools.length}`,
      );
    }

    const toolResults = tools.map((tool) => {
      const desc = tool.description ?? "";
      if (desc.length < 20) {
        errors.push(
          `Tool "${tool.name}" has short description (${desc.length} chars). Minimum recommended: 20.`,
        );
      }
      return {
        name: tool.name,
        description: desc,
        descriptionLength: desc.length,
        hasInputSchema: !!tool.inputSchema,
      };
    });

    await client.close();

    return {
      connected: true,
      toolCount: tools.length,
      tools: toolResults,
      errors,
    };
  } catch (error) {
    try {
      await client.close();
    } catch {
      // ignore close errors
    }
    return {
      connected: false,
      toolCount: 0,
      tools: [],
      errors: [
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
}
