// Type definitions for the real Tochka Bank uAPI (https://enter.tochka.com/uapi).
// Banking responses are wrapped in a { Data, Links, Meta } envelope; inner fields
// are camelCase. The OAuth token endpoint (/connect/token) is NOT enveloped.
// Some field sets (customer info, transaction lines) are not fully documented in
// the rendered portal, so those interfaces stay permissive (index signatures).

export interface TochkaLinks {
  self?: string;
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

export interface TochkaMeta {
  totalPages?: number;
}

export interface TochkaEnvelope<T> {
  Data: T;
  Links?: TochkaLinks;
  Meta?: TochkaMeta;
}

// ---- Authentication ----

export interface AuthProvider {
  /** Returns a valid bearer access token, refreshing transparently as needed. */
  getAccessToken(): Promise<string>;
  /** Drops any cached access token so the next call forces a refresh. */
  invalidate(): void;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface StoredTokens {
  accessToken?: string;
  /** epoch ms */
  accessTokenExpiresAt?: number;
  refreshToken?: string;
  consentId?: string;
  scope?: string;
  /** epoch ms */
  obtainedAt?: number;
}

// ---- Accounts / balances ----

export interface AccountDetail {
  schemeName?: string;
  identification?: string;
  name?: string;
}

export interface Account {
  customerCode?: string;
  accountId?: string;
  transitAccount?: string;
  status?: string;
  statusUpdateDateTime?: string;
  currency?: string;
  accountType?: string;
  accountSubType?: string;
  registrationDate?: string;
  accountDetails?: AccountDetail[];
  [key: string]: unknown;
}

export interface BalanceAmount {
  amount: number;
  currency: string;
}

export interface Balance {
  accountId?: string;
  creditDebitIndicator?: "Credit" | "Debit";
  /** OpeningAvailable | ClosingAvailable | Expected | OverdraftAvailable */
  type?: string;
  dateTime?: string;
  Amount?: BalanceAmount;
  [key: string]: unknown;
}

// ---- Statements ----

export interface Transaction {
  /** amount in the account currency */
  amount?: number;
  /** amount in rubles */
  amountNat?: number;
  currency?: string;
  [key: string]: unknown;
}

export type StatementStatus = "Created" | "Processing" | "Error" | "Ready";

export interface Statement {
  accountId?: string;
  statementId?: string;
  status?: StatementStatus | string;
  startDateTime?: string;
  endDateTime?: string;
  creationDateTime?: string;
  startDateBalance?: number;
  endDateBalance?: number;
  Transaction?: Transaction[];
  [key: string]: unknown;
}

// ---- Customers ----

export interface Customer {
  customerCode?: string;
  customerType?: string;
  // INN/KPP/OGRN field names are not verifiable from the rendered portal docs —
  // parse defensively via the index signature.
  [key: string]: unknown;
}

// ---- Payments ----

export type PaymentStatusValue =
  | "Initiated"
  | "Wait For Owner Requisites"
  | "NotAllowed"
  | "Allowed"
  | "WaitingForSign"
  | "WaitingForCreate"
  | "Created"
  | "Paid"
  | "Canceled"
  | "Rejected";

/** Body fields for POST /payment/v1.0/for-sign (wrapped in { Data: ... } by the client). */
export interface PaymentForSignRequest {
  accountCode: string;
  bankCode?: string;
  counterpartyAccountNumber: string;
  counterpartyBankBic: string;
  counterpartyName: string;
  paymentAmount: number;
  paymentDate: string;
  paymentPurpose: string;
  counterpartyINN?: string;
  counterpartyKPP?: string;
  counterpartyBankCorrAccount?: string;
  payerINN?: string;
  payerKPP?: string;
  paymentNumber?: number;
  paymentPriority?: string;
  taxInfoKBK?: string;
  taxInfoOKATO?: string;
  budgetPaymentCode?: string;
  [key: string]: unknown;
}

export interface PaymentForSignResult {
  requestId: string;
}

export interface PaymentStatusResult {
  requestId?: string;
  status?: PaymentStatusValue | string;
  errors?: unknown[];
}

// ---- Errors ----

export interface TochkaErrorItem {
  errorCode?: string;
  ErrorCode?: string;
  message?: string;
  Message?: string;
  url?: string;
  Url?: string;
  path?: string;
  Path?: string;
}

export interface TochkaErrorEnvelope {
  code?: number | string;
  Code?: number | string;
  id?: string;
  Id?: string;
  message?: string;
  Message?: string;
  Errors?: TochkaErrorItem[];
  errors?: TochkaErrorItem[];
}
