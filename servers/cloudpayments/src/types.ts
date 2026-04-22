/** Standard CloudPayments API response */
export interface CloudPaymentsResponse<T = unknown> {
  Success: boolean;
  Message: string | null;
  Model: T;
}

/** CloudPayments transaction */
export interface Transaction {
  TransactionId: number;
  Amount: number;
  Currency: string;
  CurrencyCode: number;
  InvoiceId?: string;
  AccountId?: string;
  Email?: string;
  Description?: string;
  CardFirstSix: string;
  CardLastFour: string;
  CardExpDate: string;
  CardType: string;
  IssuerBankCountry: string;
  Status: "AwaitingAuthentication" | "Authorized" | "Completed" | "Cancelled" | "Declined";
  StatusCode: number;
  Reason: string;
  ReasonCode: number;
  Token?: string;
  TestMode: boolean;
  DateTime: string;
  TotalFee?: number;
  JsonData?: string;
}

/** CloudPayments refund */
export interface Refund {
  TransactionId: number;
  Amount: number;
  DateTime: string;
}

/** CloudPayments error */
export interface CloudPaymentsError {
  Success: false;
  Message: string;
}
