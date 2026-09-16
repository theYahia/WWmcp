export interface KavenegarSendResult {
  messageid: number;
  message: string;
  status: number;
  statustext: string;
  sender: string;
  receptor: string;
  date: number;
  cost: number;
}

export interface KavenegarAccountInfo {
  remaincredit: number;
  expiredate: number;
  type: string;
}

export interface KavenegarDeliveryStatus {
  messageid: number;
  status: number;
  statustext: string;
}

export interface KavenegarResponse<T> {
  return: {
    status: number;
    message: string;
  };
  entries: T;
}
