import { z } from "zod";
import { cpPost } from "../client.js";
import type { Transaction } from "../types.js";

// --- Schemas ---

export const chargeSchema = z.object({
  Amount: z.number().positive().describe("Payment amount"),
  Currency: z.string().default("RUB").describe("Currency code (RUB, USD, EUR, etc.)"),
  IpAddress: z.string().describe("Payer IP address"),
  CardCryptogramPacket: z.string().describe("Card cryptogram from CloudPayments widget"),
  Name: z.string().optional().describe("Cardholder name"),
  InvoiceId: z.string().optional().describe("Order ID in your system"),
  Description: z.string().optional().describe("Payment description"),
  AccountId: z.string().optional().describe("User identifier"),
  Email: z.string().optional().describe("Email for receipt"),
  JsonData: z.string().optional().describe("Additional data (JSON string)"),
});

export const authSchema = z.object({
  Amount: z.number().positive().describe("Authorization (hold) amount"),
  Currency: z.string().default("RUB").describe("Currency code"),
  IpAddress: z.string().describe("Payer IP address"),
  CardCryptogramPacket: z.string().describe("Card cryptogram"),
  Name: z.string().optional().describe("Cardholder name"),
  InvoiceId: z.string().optional().describe("Order ID"),
  Description: z.string().optional().describe("Payment description"),
  AccountId: z.string().optional().describe("User identifier"),
  Email: z.string().optional().describe("Email for receipt"),
  JsonData: z.string().optional().describe("Additional data (JSON string)"),
});

export const confirmSchema = z.object({
  TransactionId: z.number().int().positive().describe("Transaction ID to confirm"),
  Amount: z.number().positive().describe("Confirm amount (can be less than authorized)"),
  JsonData: z.string().optional().describe("Additional data (JSON string)"),
});

export const voidSchema = z.object({
  TransactionId: z.number().int().positive().describe("Transaction ID to void"),
});

export const getTransactionSchema = z.object({
  TransactionId: z.number().int().positive().describe("Transaction ID"),
});

// --- Handlers ---

export async function handleCharge(params: z.infer<typeof chargeSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost<Transaction>("/payments/charge", body);
  return JSON.stringify(result, null, 2);
}

export async function handleAuth(params: z.infer<typeof authSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost<Transaction>("/payments/auth", body);
  return JSON.stringify(result, null, 2);
}

export async function handleConfirm(params: z.infer<typeof confirmSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost("/payments/confirm", body);
  return JSON.stringify(result, null, 2);
}

export async function handleVoid(params: z.infer<typeof voidSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost("/payments/void", body);
  return JSON.stringify(result, null, 2);
}

export async function handleGetTransaction(params: z.infer<typeof getTransactionSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost<Transaction>("/payments/find", body);
  return JSON.stringify(result, null, 2);
}
