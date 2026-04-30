export interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  CONTACT_ID: string;
  COMPANY_ID: string;
  ASSIGNED_BY_ID: string;
  DATE_CREATE: string;
  DATE_MODIFY: string;
  CLOSEDATE: string;
  COMMENTS: string;
}

export interface BitrixContact {
  ID: string;
  NAME: string;
  LAST_NAME: string;
  PHONE: { VALUE: string; VALUE_TYPE: string }[];
  EMAIL: { VALUE: string; VALUE_TYPE: string }[];
  COMPANY_ID: string;
  ASSIGNED_BY_ID: string;
  DATE_CREATE: string;
}

export interface BitrixTask {
  id: string;
  title: string;
  description: string;
  responsibleId: string;
  createdBy: string;
  status: string;
  deadline: string;
  priority: string;
}

export interface BitrixListResult<T> {
  result: T[];
  total: number;
  next?: number;
}

export interface BitrixAddResult {
  result: number;
}
