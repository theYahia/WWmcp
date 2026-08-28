import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const indexSrc = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
const skillsDir = fileURLToPath(new URL("../.claude/skills", import.meta.url));

// Tool names registered via server.tool(...) / server.registerTool(...) in src/index.ts.
const registeredTools = new Set(
  [...indexSrc.matchAll(/server\.(?:tool|registerTool)\(\s*["']([a-z_]+)["']/g)].map((m) => m[1]),
);

// Backticked snake_case tokens in a skill body that look like a tool reference
// (start with one of our tool verb prefixes).
const TOOL_VERB_PREFIXES = ["get_", "list_", "create_", "cancel_", "capture_", "save_", "delete_"];
function referencedTools(body: string): string[] {
  const tokens = [...body.matchAll(/`([a-z][a-z_]+)`/g)].map((m) => m[1]);
  return [...new Set(tokens.filter((t) => TOOL_VERB_PREFIXES.some((p) => t.startsWith(p))))];
}

describe("bundled skills ↔ registered tools consistency", () => {
  it("found a non-trivial set of registered tools", () => {
    expect(registeredTools.size).toBeGreaterThanOrEqual(20);
  });

  const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  it.each(skillDirs)("skill %s references only existing tools", (name) => {
    const body = readFileSync(`${skillsDir}/${name}/SKILL.md`, "utf8");
    const refs = referencedTools(body);
    for (const ref of refs) {
      expect(registeredTools, `skill "${name}" references unknown tool \`${ref}\``).toContain(ref);
    }
  });

  it.each(skillDirs)("skill %s does not restrict allowed-tools to Bash/Read (must reach MCP tools)", (name) => {
    const body = readFileSync(`${skillsDir}/${name}/SKILL.md`, "utf8");
    // A skill that declares allowed-tools limited to Bash/Read cannot call mcp__yookassa__* tools.
    const frontmatter = body.split(/^---$/m)[1] ?? "";
    if (/allowed-tools:/.test(frontmatter)) {
      expect(/mcp__/.test(frontmatter), `skill "${name}" declares allowed-tools without any mcp__ tool`).toBe(true);
    }
  });
});
