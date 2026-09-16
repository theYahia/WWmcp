import type { Signer } from "./auth/signer.js";

export interface AlfaAuthConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  /** OAuth/OIDC scope(s), space-separated. Required by some Alfa API methods. */
  scope?: string;
  /** Per-request timeout in milliseconds (default 15000). */
  timeoutMs?: number;
  /** Signer for operational (money-moving) methods. Defaults to UnimplementedSigner. */
  signer?: Signer;
}

export interface AlfaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  /** OpenID Connect ID token (Alfa ID issues OIDC tokens from /oidc/token). */
  id_token?: string;
}

export interface AlfaAccount {
  id: string;
  number: string;
  currency: string;
  name: string;
  status: string;
  type: string;
}

export interface AlfaBalance {
  accountId: string;
  amount: number;
  currency: string;
  date: string;
}

export interface AlfaStatementEntry {
  id: string;
  date: string;
  amount: number;
  currency: string;
  purpose: string;
  counterpartyName: string;
  counterpartyAccount: string;
  counterpartyBik: string;
  direction: "CREDIT" | "DEBIT";
}

export interface AlfaStatement {
  accountId: string;
  dateFrom: string;
  dateTo: string;
  openingBalance: number;
  closingBalance: number;
  entries: AlfaStatementEntry[];
}

export interface AlfaPaymentOrder {
  id: string;
  status: string;
  fromAccount: string;
  toAccount: string;
  toBik: string;
  amount: number;
  currency: string;
  purpose: string;
  createdAt: string;
}

export interface AlfaCounterparty {
  id: string;
  name: string;
  inn: string;
  kpp: string;
  bik: string;
  account: string;
}

export interface AlfaExchangeRate {
  currencyFrom: string;
  currencyTo: string;
  buyRate: number;
  sellRate: number;
  cbRate: number;
  date: string;
}

export interface AlfaSalaryRegistry {
  id: string;
  status: string;
  totalAmount: number;
  employeeCount: number;
  createdAt: string;
}

export interface AlfaApiError {
  code: string;
  message: string;
  details?: string;
}
