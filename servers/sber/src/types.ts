export interface Account {
  id: string;
  number: string;
  currency: string;
  balance: number;
  name?: string;
  state?: string;
}

export interface AccountsResponse {
  accounts: Account[];
}

export interface Balance {
  accountId: string;
  amount: number;
  currency: string;
  date: string;
}

export interface BalanceResponse {
  balances: Balance[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description?: string;
  counterparty?: string;
  type: string;
}

export interface StatementResponse {
  transactions: Transaction[];
  account: string;
  dateFrom: string;
  dateTo: string;
}

export interface PaymentRequest {
  payerAccount: string;
  payeeAccount: string;
  payeeName: string;
  payeeBankBic: string;
  amount: number;
  currency: string;
  purpose: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  createdAt: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: string;
  updatedAt: string;
}
