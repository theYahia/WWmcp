export interface TKassaPayment {
  TerminalKey: string;
  Amount: number;
  OrderId: string;
  Success: boolean;
  Status: string;
  PaymentId: string;
  ErrorCode: string;
  Message?: string;
  Details?: string;
  PaymentURL?: string;
}

export interface TKassaRefund {
  TerminalKey: string;
  PaymentId: string;
  OriginalAmount: number;
  NewAmount: number;
  OrderId: string;
  Success: boolean;
  Status: string;
  ErrorCode: string;
  Message?: string;
}

export interface TKassaError {
  Success: false;
  ErrorCode: string;
  Message?: string;
  Details?: string;
}

export interface TKassaResponse {
  Success: boolean;
  ErrorCode: string;
  TerminalKey?: string;
  Status?: string;
  PaymentId?: string;
  OrderId?: string;
  Amount?: number;
  Message?: string;
  Details?: string;
  PaymentURL?: string;
  OriginalAmount?: number;
  NewAmount?: number;
}
