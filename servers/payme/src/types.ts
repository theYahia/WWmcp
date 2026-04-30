export interface PaymeCard {
  number: string;
  expire: string; // MMYY
  token?: string;
  recurrent?: boolean;
  verify?: boolean;
}

export interface PaymeReceipt {
  _id: string;
  create_time: number;
  pay_time: number;
  cancel_time: number;
  state: number;
  amount: number; // in TIYINS
  account: Record<string, string>;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
