import { z } from "zod";
import type { TochkaBankClient } from "../client.js";
import { jsonResult, type ToolDef } from "./_shared.js";

// Tochka has no "counterparties" CRUD resource (the v1 list_counterparties /
// create_counterparty tools were fabricated). The real concepts are the
// `customers` resource (your own legal entities) below; external counterparties
// are derived from statement transactions via get_statement.

export const listCustomersTool: ToolDef = {
  name: "list_customers",
  config: {
    title: "List customers",
    description: "List your Tochka customer codes (the legal entities available to this token).",
    inputSchema: {},
    outputSchema: { customers: z.array(z.unknown()) },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (client: TochkaBankClient) => {
    const customers = await client.listCustomers();
    return jsonResult({ customers });
  },
};

export const getCompanyInfoTool: ToolDef = {
  name: "get_company_info",
  config: {
    title: "Get company info",
    description:
      "Get your company details (name, INN, KPP, OGRN, etc.) for a customer code. If customer_code is omitted and you have exactly one customer, it is selected automatically.",
    inputSchema: {
      customer_code: z
        .string()
        .optional()
        .describe("Customer code; optional if you have only one customer."),
    },
    outputSchema: { customer: z.record(z.unknown()) },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (client: TochkaBankClient, args: { customer_code?: string }) => {
    let code = args.customer_code;
    if (!code) {
      const customers = await client.listCustomers();
      if (customers.length === 1) {
        code = customers[0].customerCode;
      } else if (customers.length === 0) {
        throw new Error("No customers are available for this token.");
      } else {
        const codes = customers.map((c) => c.customerCode).filter(Boolean);
        throw new Error(
          `Multiple customers found; pass customer_code. Available: ${codes.join(", ")}`,
        );
      }
    }
    if (!code) throw new Error("Could not determine a customer code.");
    const customer = await client.getCustomer(code);
    return jsonResult({ customer });
  },
};
