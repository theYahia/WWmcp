export interface IletiSmsResponse {
  status: string;
  messageId: string;
  code: number;
  description?: string;
}

export interface IletiBulkSmsResponse {
  status: string;
  orderId: string;
  totalCount: number;
  successCount: number;
  failCount: number;
}

export interface IletiSmsReport {
  messageId: string;
  recipient: string;
  status: string;
  deliveredAt?: string;
  errorCode?: string;
}

export interface IletiBalance {
  balance: number;
  currency: string;
  smsCredits: number;
}

export interface IletiSender {
  id: string;
  name: string;
  status: string;
}

export interface IletiContactGroup {
  id: string;
  name: string;
  contactCount: number;
}

export interface IletiContact {
  id: string;
  phoneNumber: string;
  name?: string;
  surname?: string;
  email?: string;
  groupId?: string;
}

export interface IletiApiResponse {
  [key: string]: unknown;
}
