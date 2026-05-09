import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NAME_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;

const REGIONS = [
  "russia", "cis", "turkey", "mena", "gulf",
  "africa", "latam", "sea", "south-asia", "global",
];
const CATEGORIES = [
  "payments", "crm", "logistics", "comms", "ai",
  "data", "hr", "marketing", "finance", "ecommerce", "other",
];
const AUTH_TYPES = ["api-key", "bearer", "oauth2", "hmac", "none"];

const USAGE = `
Usage: create-mcp <name> [options]

Scaffolds a new MCP server in servers/<name>/ from the production-grade template.

Required:
  <name>                  Lowercase hyphenated name (e.g., "tinkoff" or "pochta-russia")

Options:
  --region=<region>       ${REGIONS.join(" | ")}
  --category=<category>   ${CATEGORIES.join(" | ")}
  --base-url=<url>        API base URL (e.g., https://api.example.com/v1)
  --auth=<type>           ${AUTH_TYPES.join(" | ")} (default: api-key)
  --description=<text>    Short description for package.json and README
  --target-dir=<path>     Override target directory (default: servers/<name> in detected monorepo root)
  --dry-run               Print actions without writing files
  --help                  Show this help

Examples:
  npx @theyahia/create-mcp tinkoff \\
    --region=russia --category=payments \\
    --base-url=https://securepay.tinkoff.ru/v2 \\
    --description="Tinkoff Acquiring API"

  npx @theyahia/create-mcp m-pesa \\
    --region=africa --category=payments \\
    --base-url=https://sandbox.safaricom.co.ke

After scaffolding:
  cd servers/<name>
  pnpm install     # from monorepo root
  pnpm test --filter @theyahia/<name>-mcp
  # implement your tools, then:
  pnpm changeset
`.trimStart();

export function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      args.flags.help = true;
    } else if (arg === "--dry-run") {
      args.flags["dry-run"] = true;
    } else if (arg.startsWith("--")) {
      const [k, ...rest] = arg.slice(2).split("=");
      args.flags[k] = rest.length ? rest.join("=") : true;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

export function validateName(name) {
  if (!name) throw new Error("Missing <name>. Run with --help for usage.");
  if (!NAME_RE.test(name)) {
    throw new Error(
      `Invalid name "${name}". Must be lowercase, start with a letter, ` +
        `contain only [a-z0-9-], and not start/end with a hyphen. ` +
        `Examples: "tinkoff", "m-pesa", "pochta-russia".`,
    );
  }
  if (name.endsWith("-mcp")) {
    throw new Error(
      `Don't include the "-mcp" suffix in the name — it's added automatically. ` +
        `Use "${name.slice(0, -4)}" instead.`,
    );
  }
}

function validateOption(label, value, allowed) {
  if (!value) return;
  if (!allowed.includes(value)) {
    throw new Error(
      `Invalid --${label}="${value}". Allowed: ${allowed.join(", ")}.`,
    );
  }
}

async function findMonorepoRoot(start) {
  let cur = path.resolve(start);
  while (true) {
    try {
      await fs.access(path.join(cur, "pnpm-workspace.yaml"));
      return cur;
    } catch {}
    const parent = path.dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

async function findTemplateDir(monorepoRoot) {
  const candidates = [
    monorepoRoot && path.join(monorepoRoot, "servers", "_template"),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "..",
      "servers",
      "_template",
    ),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) return dir;
    } catch {}
  }
  return null;
}

// Files in _template/ that document the template itself — must NOT be copied
// into the new server (they'd confuse the contributor).
const TEMPLATE_META_FILES = new Set(["HOW_TO_TEMPLATE.md"]);

async function copyDir(src, dst, dryRun) {
  if (dryRun) {
    console.log(`  [dry-run] copy ${src} → ${dst}`);
    return;
  }
  await fs.cp(src, dst, {
    recursive: true,
    filter: (source) => !TEMPLATE_META_FILES.has(path.basename(source)),
  });
}

export function buildReplacements({ name, baseUrl, description, region, category }) {
  const envPrefix = name.toUpperCase().replace(/-/g, "_");
  const desc =
    description ||
    `MCP server for ${name} API — ${category || "general"} (${region || "global"}).`;
  // Order matters: specific patterns must run BEFORE generic CHANGEME.
  return [
    // Keyword tuple in package.json — match BEFORE generic CHANGEME swap.
    [
      /"russian-api",\s*"CHANGEME"/g,
      `"${region || "global"}", "${category || "other"}", "${name}"`,
    ],
    // Description placeholder — match BEFORE generic CHANGEME API.
    [/CHANGEME API — DESCRIBE TOOLS HERE\./g, desc],
    // Repo subdirectory — match BEFORE generic CHANGEME.
    [/servers\/CHANGEME"/g, `servers/${name}"`],
    // Package + bin names.
    [/@theyahia\/CHANGEME-mcp/g, `@theyahia/${name}-mcp`],
    [/io\.github\.theYahia\/CHANGEME-mcp/g, `io.github.theYahia/${name}-mcp`],
    [/CHANGEME-mcp/g, `${name}-mcp`],
    // Env var prefix (e.g., CHANGEME_API_KEY → TINKOFF_API_KEY).
    [/CHANGEME_API_KEY/g, `${envPrefix}_API_KEY`],
    // Bare quoted CHANGEME — last resort generic CHANGEME swap.
    [/"CHANGEME"/g, `"${name}"`],
    [/CHANGEME API/g, `${name} API`],
    // Base URL.
    [
      /https:\/\/api\.example\.com\/v1/g,
      baseUrl || "https://api.example.com/v1",
    ],
  ];
}

async function applyReplacements(dir, replacements, dryRun) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await applyReplacements(full, replacements, dryRun);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (![".ts", ".js", ".mjs", ".json", ".md", ".yml", ".yaml"].includes(ext)) continue;
      let content = await fs.readFile(full, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        const next = content.replace(from, to);
        if (next !== content) {
          changed = true;
          content = next;
        }
      }
      if (changed) {
        if (dryRun) {
          console.log(`  [dry-run] patch ${path.relative(dir, full)}`);
        } else {
          await fs.writeFile(full, content);
        }
      }
    }
  }
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function run(argv) {
  const args = parseArgs(argv);

  if (args.flags.help) {
    console.log(USAGE);
    return;
  }

  const [name] = args._;
  validateName(name);
  validateOption("region", args.flags.region, REGIONS);
  validateOption("category", args.flags.category, CATEGORIES);
  validateOption("auth", args.flags.auth, AUTH_TYPES);

  const cwd = process.cwd();
  const monorepoRoot = await findMonorepoRoot(cwd);

  let target;
  if (args.flags["target-dir"]) {
    target = path.resolve(cwd, args.flags["target-dir"]);
  } else if (monorepoRoot) {
    target = path.join(monorepoRoot, "servers", name);
  } else {
    target = path.join(cwd, name);
    console.log(
      `[33mwarn[0m: not inside a pnpm-workspace monorepo — scaffolding into ${target}`,
    );
  }

  if (await pathExists(target)) {
    throw new Error(`Target directory already exists: ${target}`);
  }

  const templateDir = await findTemplateDir(monorepoRoot);
  if (!templateDir) {
    throw new Error(
      `Could not find servers/_template/ — run this from inside the WWmcp monorepo, ` +
        `or pass --target-dir explicitly.`,
    );
  }

  const dryRun = !!args.flags["dry-run"];
  console.log(`\n[36mcreate-mcp[0m: scaffolding [1m${name}[0m`);
  console.log(`  template: ${templateDir}`);
  console.log(`  target:   ${target}`);
  if (args.flags.region) console.log(`  region:   ${args.flags.region}`);
  if (args.flags.category) console.log(`  category: ${args.flags.category}`);
  if (args.flags["base-url"])
    console.log(`  base-url: ${args.flags["base-url"]}`);
  console.log("");

  await copyDir(templateDir, target, dryRun);

  const replacements = buildReplacements({
    name,
    baseUrl: args.flags["base-url"],
    description: args.flags.description,
    region: args.flags.region,
    category: args.flags.category,
  });
  if (!dryRun) {
    await applyReplacements(target, replacements, dryRun);
  } else {
    console.log("  [dry-run] would patch placeholders in *.ts, *.json, *.md");
  }

  if (dryRun) {
    console.log("\n[33mdry-run[0m: nothing was written.\n");
    return;
  }

  console.log(`[32m✓[0m scaffolded servers/${name}/`);
  console.log(`\nNext steps:\n`);
  console.log(`  cd ${path.relative(cwd, target) || "."}`);
  console.log(`  pnpm install                              # from monorepo root`);
  console.log(`  # 1. open src/client.ts — verify base URL and auth strategy`);
  console.log(`  # 2. open src/tools/example.ts — implement your first real tool`);
  console.log(`  # 3. add 7+ more tools to reach the 8+ production-grade minimum`);
  console.log(`  # 4. update README.md with the tool list and demo prompts`);
  console.log(`  pnpm test --filter @theyahia/${name}-mcp`);
  console.log(`  pnpm changeset                            # describe your change`);
  console.log("");
  console.log(`See CONTRIBUTING.md for the full production-grade checklist.`);
}
