import { z } from "zod";
import { oneCGet, oneCPatch, buildODataPath } from "../client.js";

// ──────────────────────────────────────────────────────────────
// get_constant — прочитать значение константы 1С (Constant_*)
// ──────────────────────────────────────────────────────────────

export const getConstantSchema = z.object({
  constant_name: z
    .string()
    .describe("Имя константы (например, Constant_ОсновнаяВалюта или ОсновнаяВалюта)"),
});

function asConstantEntity(name: string): string {
  return name.startsWith("Constant_") ? name : `Constant_${name}`;
}

export async function handleGetConstant(
  params: z.infer<typeof getConstantSchema>,
): Promise<string> {
  const path = buildODataPath(asConstantEntity(params.constant_name), { $format: "json" });
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// set_constant — записать значение константы (OData PATCH)
// ──────────────────────────────────────────────────────────────

export const setConstantSchema = z.object({
  constant_name: z.string().describe("Имя константы (Constant_* или короткое имя)"),
  value: z.unknown().describe("Новое значение константы (поле Value)"),
});

export async function handleSetConstant(
  params: z.infer<typeof setConstantSchema>,
): Promise<string> {
  const path = buildODataPath(asConstantEntity(params.constant_name), { $format: "json" });
  const result = await oneCPatch(path, { Value: params.value });
  return JSON.stringify(result, null, 2);
}
