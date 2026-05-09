import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs, validateName, buildReplacements } from "./index.js";

test("parseArgs collects positional and flag args", () => {
  const r = parseArgs([
    "tinkoff",
    "--region=russia",
    "--category=payments",
    "--base-url=https://api.example.com",
  ]);
  assert.deepEqual(r._, ["tinkoff"]);
  assert.equal(r.flags.region, "russia");
  assert.equal(r.flags.category, "payments");
  assert.equal(r.flags["base-url"], "https://api.example.com");
});

test("parseArgs treats --help and --dry-run as boolean flags", () => {
  const r = parseArgs(["--help", "--dry-run"]);
  assert.equal(r.flags.help, true);
  assert.equal(r.flags["dry-run"], true);
});

test("validateName accepts simple lowercase hyphenated names", () => {
  assert.doesNotThrow(() => validateName("tinkoff"));
  assert.doesNotThrow(() => validateName("m-pesa"));
  assert.doesNotThrow(() => validateName("pochta-russia"));
});

test("validateName rejects empty / invalid names", () => {
  assert.throws(() => validateName(""), /Missing/);
  assert.throws(() => validateName("Tinkoff"), /Invalid name/);
  assert.throws(() => validateName("tinkoff_payments"), /Invalid name/);
  assert.throws(() => validateName("-tinkoff"), /Invalid name/);
  assert.throws(() => validateName("tinkoff-"), /Invalid name/);
});

test("validateName rejects names ending in -mcp", () => {
  assert.throws(() => validateName("tinkoff-mcp"), /Don't include the "-mcp" suffix/);
});

test("buildReplacements derives env-var prefix from name", () => {
  const reps = buildReplacements({
    name: "m-pesa",
    baseUrl: "https://api.safaricom.co.ke",
    description: "M-Pesa Daraja",
    region: "africa",
    category: "payments",
  });
  const findRule = (re) =>
    reps.find(([from]) => from.toString() === re.toString());
  const envRule = findRule(/CHANGEME_API_KEY/g);
  assert.ok(envRule, "must contain env-key replacement rule");
  assert.equal(envRule[1], "M_PESA_API_KEY");
});

test("buildReplacements specific patterns precede generic CHANGEME swap", () => {
  // Specific keyword tuple replacement must run before /"CHANGEME"/g.
  const reps = buildReplacements({
    name: "test",
    baseUrl: "https://x",
    region: "africa",
    category: "payments",
  });
  const idxKeywords = reps.findIndex(
    ([from]) => from.toString() === '/"russian-api",\\s*"CHANGEME"/g',
  );
  const idxGenericQuoted = reps.findIndex(
    ([from]) => from.toString() === '/"CHANGEME"/g',
  );
  assert.ok(idxKeywords >= 0, "keyword tuple rule present");
  assert.ok(idxGenericQuoted >= 0, "generic quoted rule present");
  assert.ok(
    idxKeywords < idxGenericQuoted,
    "keyword tuple rule must come before generic quoted CHANGEME rule",
  );
});

test("buildReplacements substitutes base URL", () => {
  const reps = buildReplacements({
    name: "foo",
    baseUrl: "https://api.foo.io/v3",
  });
  const baseRule = reps.find(([from]) =>
    from.toString().includes("api\\.example\\.com"),
  );
  assert.ok(baseRule);
  assert.equal(baseRule[1], "https://api.foo.io/v3");
});
