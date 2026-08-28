import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";
import { ok, fail, runTool, toOrderView, toOrderSummary, presentOrderList, type ToolResult } from "../format/index.js";
import { dateField, detailField, rawField, siteField, pageField, limitField } from "./common.js";
import type { RawOrder } from "../types.js";

// ── list_orders ──────────────────────────────────────────────
export const listOrdersSchema = z.object({
  filter_status: z.string().optional().describe("Filter by order status code (e.g. 'new', 'complete'). Call list_statuses for valid codes."),
  filter_customer: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_number: z.string().optional().describe("Filter by order number"),
  filter_date_from: dateField("Filter orders created on/after this date (YYYY-MM-DD)").optional(),
  filter_date_to: dateField("Filter orders created on/before this date (YYYY-MM-DD)").optional(),
  detail: detailField,
  raw: rawField,
  page: pageField,
  limit: limitField,
});

export async function handleListOrders(params: z.infer<typeof listOrdersSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_status) query["filter[status]"] = params.filter_status;
    if (params.filter_customer) query["filter[customer]"] = params.filter_customer;
    if (params.filter_number) query["filter[number]"] = params.filter_number;
    if (params.filter_date_from) query["filter[createdAtFrom]"] = params.filter_date_from;
    if (params.filter_date_to) query["filter[createdAtTo]"] = params.filter_date_to;

    const result = await retailCrmGet("/orders", query);
    if (params.raw) return ok(result);
    return ok(presentOrderList(result, params.detail));
  });
}

// ── get_order ────────────────────────────────────────────────
export const getOrderSchema = z.object({
  id: z.string().describe("Order ID or externalId to retrieve"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field: 'id' (RetailCRM ID) or 'externalId'"),
  detail: detailField,
  raw: rawField,
});

export async function handleGetOrder(params: z.infer<typeof getOrderSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = {};
    if (params.by === "externalId") query["by"] = "externalId";
    const result = await retailCrmGet(`/orders/${encodeURIComponent(params.id)}`, query) as { order?: RawOrder };
    if (params.raw || !result?.order) return ok(result);
    const view = params.detail === "full" ? toOrderView(result.order) : toOrderSummary(result.order);
    return ok({ order: view });
  });
}

// ── create_order ─────────────────────────────────────────────
export const createOrderSchema = z.object({
  first_name: z.string().optional().describe("Customer first name (omit only when linking by customer_id/customer_external_id)"),
  last_name: z.string().optional().describe("Customer last name"),
  phone: z.string().optional().describe("Customer phone number"),
  email: z.string().optional().describe("Customer email"),
  customer_id: z.number().int().optional().describe("Link the order to an EXISTING customer by RetailCRM ID (mutually exclusive with inline name/phone/email)"),
  customer_external_id: z.string().optional().describe("Link the order to an EXISTING customer by externalId"),
  order_type: z.string().default("eshop-individual").describe("Order type code"),
  status: z.string().optional().describe("Initial order status code (e.g. 'new')"),
  items: z.array(z.object({
    product_name: z.string().describe("Product display name"),
    quantity: z.number().min(1).describe("Quantity"),
    initial_price: z.number().describe("Price per unit"),
  })).min(1).describe("Order items (at least one required)"),
  delivery_code: z.string().optional().describe("Delivery type code"),
  delivery_cost: z.number().optional().describe("Delivery cost"),
  delivery_address: z.string().optional().describe("Delivery address as free text"),
  site: siteField,
});

export async function handleCreateOrder(params: z.infer<typeof createOrderSchema>): Promise<ToolResult> {
  return runTool(async () => {
    if (!params.customer_id && !params.customer_external_id && !params.first_name) {
      return fail("Provide first_name for a new customer, or customer_id/customer_external_id to link an existing one");
    }
    const order: Record<string, unknown> = {
      orderType: params.order_type,
      items: params.items.map(item => ({
        offer: { displayName: item.product_name },
        quantity: item.quantity,
        initialPrice: item.initial_price,
      })),
    };
    if (params.first_name) order.firstName = params.first_name;
    if (params.last_name) order.lastName = params.last_name;
    if (params.status) order.status = params.status;

    if (params.customer_id) {
      order.customer = { id: params.customer_id };
    } else if (params.customer_external_id) {
      order.customer = { externalId: params.customer_external_id };
    } else if (params.phone || params.email) {
      const customer: Record<string, unknown> = { firstName: params.first_name };
      if (params.last_name) customer.lastName = params.last_name;
      if (params.phone) customer.phones = [{ number: params.phone }];
      if (params.email) customer.email = params.email;
      order.customer = customer;
    }

    if (params.delivery_code || params.delivery_cost !== undefined || params.delivery_address) {
      const delivery: Record<string, unknown> = {};
      if (params.delivery_code) delivery.code = params.delivery_code;
      if (params.delivery_cost !== undefined) delivery.cost = params.delivery_cost;
      if (params.delivery_address) delivery.address = { text: params.delivery_address };
      order.delivery = delivery;
    }

    const form: Record<string, string> = { order: JSON.stringify(order) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/orders/create", form);
    return ok(result);
  });
}

// ── update_order ─────────────────────────────────────────────
export const updateOrderSchema = z.object({
  id: z.string().describe("Order ID to update"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field"),
  status: z.string().optional().describe("New status code"),
  first_name: z.string().optional().describe("Updated customer first name"),
  last_name: z.string().optional().describe("Updated customer last name"),
  phone: z.string().optional().describe("Updated customer phone"),
  email: z.string().optional().describe("Updated customer email"),
  customer_id: z.number().int().optional().describe("Re-link the order to an existing customer by RetailCRM ID"),
  customer_external_id: z.string().optional().describe("Re-link the order to an existing customer by externalId"),
  delivery_code: z.string().optional().describe("Updated delivery type code"),
  delivery_cost: z.number().optional().describe("Updated delivery cost"),
  delivery_address: z.string().optional().describe("Updated delivery address"),
  manager_comment: z.string().optional().describe("Internal manager comment"),
  customer_comment: z.string().optional().describe("Customer-visible comment"),
  site: siteField,
});

export async function handleUpdateOrder(params: z.infer<typeof updateOrderSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const order: Record<string, unknown> = {};
    if (params.status) order.status = params.status;
    if (params.first_name) order.firstName = params.first_name;
    if (params.last_name) order.lastName = params.last_name;
    if (params.manager_comment) order.managerComment = params.manager_comment;
    if (params.customer_comment) order.customerComment = params.customer_comment;

    if (params.customer_id) {
      order.customer = { id: params.customer_id };
    } else if (params.customer_external_id) {
      order.customer = { externalId: params.customer_external_id };
    } else if (params.phone || params.email) {
      const customer: Record<string, unknown> = {};
      if (params.phone) customer.phones = [{ number: params.phone }];
      if (params.email) customer.email = params.email;
      order.customer = customer;
    }

    if (params.delivery_code || params.delivery_cost !== undefined || params.delivery_address) {
      const delivery: Record<string, unknown> = {};
      if (params.delivery_code) delivery.code = params.delivery_code;
      if (params.delivery_cost !== undefined) delivery.cost = params.delivery_cost;
      if (params.delivery_address) delivery.address = { text: params.delivery_address };
      order.delivery = delivery;
    }

    const form: Record<string, string> = { order: JSON.stringify(order) };
    if (params.by === "externalId") form.by = "externalId";
    if (params.site) form.site = params.site;
    const result = await retailCrmPost(`/orders/${encodeURIComponent(params.id)}/edit`, form);
    return ok(result);
  });
}

// ── orders_history ───────────────────────────────────────────
export const ordersHistorySchema = z.object({
  filter_since_id: z.number().int().optional().describe("Return changes after this history entry ID (incremental sync)"),
  filter_date_from: dateField("Changes on/after this date (YYYY-MM-DD)").optional(),
  filter_date_to: dateField("Changes on/before this date (YYYY-MM-DD)").optional(),
  filter_order_id: z.number().int().optional().describe("Restrict to a single order's history by RetailCRM ID"),
  raw: rawField,
  page: pageField,
  limit: limitField,
});

export async function handleOrdersHistory(params: z.infer<typeof ordersHistorySchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_since_id !== undefined) query["filter[sinceId]"] = String(params.filter_since_id);
    if (params.filter_date_from) query["filter[startDate]"] = params.filter_date_from;
    if (params.filter_date_to) query["filter[endDate]"] = params.filter_date_to;
    if (params.filter_order_id !== undefined) query["filter[orderId]"] = String(params.filter_order_id);
    const result = await retailCrmGet("/orders/history", query);
    return ok(result);
  });
}
