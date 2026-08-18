import { z } from "zod";
import { moyskladPost } from "../client.js";
import { buildDocBody, fetchDocument, fetchDocumentList, formatDocument, positionInputSchema } from "../lib.js";
import type { ToolDef } from "../types.js";

// Reusable schema fragments.
const orgHref = z.string().describe("Meta href of the organization. Get from list_organizations");
const agentHref = z.string().describe("Meta href of the counterparty. Get from get_counterparties");
const storeHref = z.string().describe("Meta href of the warehouse/store. Get from list_stores");
const positions = z.array(positionInputSchema).min(1).describe("Document line items");
const listParams = {
  search: z.string().optional().describe("Search by name/number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
};

// --- move (перемещение между складами) ---
export const createMoveSchema = z.object({
  organization_href: orgHref,
  source_store_href: z.string().describe("Meta href of the source warehouse (ship from)"),
  target_store_href: z.string().describe("Meta href of the target warehouse (ship to)"),
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreateMove(p: z.infer<typeof createMoveSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    source_store_href: p.source_store_href,
    target_store_href: p.target_store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/move", body));
}
export const getMovesSchema = z.object(listParams);
export async function handleGetMoves(p: z.infer<typeof getMovesSchema>): Promise<string> {
  return fetchDocumentList("move", p, "moves");
}

// --- enter (оприходование) ---
export const createEnterSchema = z.object({
  organization_href: orgHref,
  store_href: storeHref,
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreateEnter(p: z.infer<typeof createEnterSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/enter", body));
}
export const getEntersSchema = z.object(listParams);
export async function handleGetEnters(p: z.infer<typeof getEntersSchema>): Promise<string> {
  return fetchDocumentList("enter", p, "enters");
}

// --- loss (списание) ---
export const createLossSchema = z.object({
  organization_href: orgHref,
  store_href: storeHref,
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreateLoss(p: z.infer<typeof createLossSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/loss", body));
}
export const getLossesSchema = z.object(listParams);
export async function handleGetLosses(p: z.infer<typeof getLossesSchema>): Promise<string> {
  return fetchDocumentList("loss", p, "losses");
}

// --- inventory (инвентаризация) ---
export const createInventorySchema = z.object({
  organization_href: orgHref,
  store_href: storeHref,
  positions: z
    .array(positionInputSchema)
    .optional()
    .describe("Optional line items (inventory can be created empty and filled later)"),
  description: z.string().optional().describe("Comment"),
});
export async function handleCreateInventory(p: z.infer<typeof createInventorySchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/inventory", body));
}
export const getInventoriesSchema = z.object(listParams);
export async function handleGetInventories(p: z.infer<typeof getInventoriesSchema>): Promise<string> {
  return fetchDocumentList("inventory", p, "inventories");
}

// --- purchaseorder (заказ поставщику) ---
export const createPurchaseOrderSchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  store_href: z.string().optional().describe("Meta href of the receiving warehouse (optional)"),
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreatePurchaseOrder(p: z.infer<typeof createPurchaseOrderSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/purchaseorder", body));
}
export const getPurchaseOrdersSchema = z.object(listParams);
export async function handleGetPurchaseOrders(p: z.infer<typeof getPurchaseOrdersSchema>): Promise<string> {
  return fetchDocumentList("purchaseorder", p, "purchase_orders");
}

// --- salesreturn (возврат покупателя) ---
export const createSalesReturnSchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  store_href: storeHref,
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreateSalesReturn(p: z.infer<typeof createSalesReturnSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/salesreturn", body));
}

// --- purchasereturn (возврат поставщику) ---
export const createPurchaseReturnSchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  store_href: storeHref,
  positions,
  description: z.string().optional().describe("Comment"),
});
export async function handleCreatePurchaseReturn(p: z.infer<typeof createPurchaseReturnSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    store_href: p.store_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/purchasereturn", body));
}

// --- generic document access (fallback for any entity type) ---
export const getDocumentsSchema = z.object({
  entity_type: z.string().describe("MoySklad entity type, e.g. 'invoiceout', 'paymentin', 'retaildemand', 'move'"),
  search: z.string().optional().describe("Search by name/number"),
  filter: z.string().optional().describe("Raw MoySklad filter expression, e.g. 'name=00001'"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});
export async function handleGetDocuments(p: z.infer<typeof getDocumentsSchema>): Promise<string> {
  return fetchDocumentList(
    p.entity_type,
    { search: p.search, filter: p.filter, limit: p.limit, offset: p.offset },
    "documents",
  );
}

export const getDocumentSchema = z.object({
  entity_type: z.string().describe("MoySklad entity type, e.g. 'customerorder', 'demand', 'supply'"),
  id: z.string().describe("Document UUID"),
});
export async function handleGetDocument(p: z.infer<typeof getDocumentSchema>): Promise<string> {
  return fetchDocument(p.entity_type, p.id);
}

export const tools: ToolDef[] = [
  {
    name: "create_move",
    description: "Create a stock transfer (move) between two warehouses.",
    schema: createMoveSchema,
    handler: handleCreateMove,
  },
  {
    name: "get_moves",
    description: "List stock transfer (move) documents.",
    schema: getMovesSchema,
    handler: handleGetMoves,
  },
  {
    name: "create_enter",
    description: "Create a stock enter (оприходование) — add stock into a warehouse.",
    schema: createEnterSchema,
    handler: handleCreateEnter,
  },
  {
    name: "get_enters",
    description: "List stock enter (оприходование) documents.",
    schema: getEntersSchema,
    handler: handleGetEnters,
  },
  {
    name: "create_loss",
    description: "Create a stock write-off (списание) from a warehouse.",
    schema: createLossSchema,
    handler: handleCreateLoss,
  },
  {
    name: "get_losses",
    description: "List stock write-off (списание) documents.",
    schema: getLossesSchema,
    handler: handleGetLosses,
  },
  {
    name: "create_inventory",
    description: "Create an inventory count (инвентаризация) for a warehouse.",
    schema: createInventorySchema,
    handler: handleCreateInventory,
  },
  {
    name: "get_inventories",
    description: "List inventory count (инвентаризация) documents.",
    schema: getInventoriesSchema,
    handler: handleGetInventories,
  },
  {
    name: "create_purchase_order",
    description: "Create a purchase order (заказ поставщику). Prices in RUBLES.",
    schema: createPurchaseOrderSchema,
    handler: handleCreatePurchaseOrder,
  },
  {
    name: "get_purchase_orders",
    description: "List purchase orders (заказы поставщикам).",
    schema: getPurchaseOrdersSchema,
    handler: handleGetPurchaseOrders,
  },
  {
    name: "create_sales_return",
    description: "Create a sales return (возврат покупателя). Prices in RUBLES.",
    schema: createSalesReturnSchema,
    handler: handleCreateSalesReturn,
  },
  {
    name: "create_purchase_return",
    description: "Create a purchase return (возврат поставщику). Prices in RUBLES.",
    schema: createPurchaseReturnSchema,
    handler: handleCreatePurchaseReturn,
  },
  {
    name: "get_documents",
    description:
      "Generic: list documents of any MoySklad entity type (fallback for entities without a dedicated tool).",
    schema: getDocumentsSchema,
    handler: handleGetDocuments,
  },
  {
    name: "get_document",
    description: "Generic: get a single document of any MoySklad entity type by UUID (positions expanded).",
    schema: getDocumentSchema,
    handler: handleGetDocument,
  },
];
