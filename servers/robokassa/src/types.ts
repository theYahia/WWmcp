export interface InvoiceParams {
  outSum: number;
  invId: number;
  description: string;
  email?: string;
  culture?: "ru" | "en";
  expirationDate?: string;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  sum: number;
  tax: "none" | "vat0" | "vat10" | "vat110" | "vat20" | "vat120";
}

export interface OpStateResult {
  invoiceId: number;
  stateCode: number;
  stateDescription: string;
  requestDate: string;
  resultCode: number;
  resultDescription: string;
  paymentMethod?: string;
  clientSum?: string;
  clientAccount?: string;
}
