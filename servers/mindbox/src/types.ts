export interface MindboxCustomer {
  ids?: Record<string, string>;
  email?: string;
  mobilePhone?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  sex?: string;
  area?: MindboxArea;
  subscriptions?: MindboxSubscription[];
  customFields?: Record<string, unknown>;
}

export interface MindboxArea {
  ids?: Record<string, string>;
  name?: string;
}

export interface MindboxSubscription {
  brand?: string;
  pointOfContact?: string;
  isSubscribed?: boolean;
  valueByDefault?: boolean;
}

export interface MindboxOrder {
  ids?: Record<string, string>;
  createdDateTimeUtc?: string;
  totalPrice?: number;
  discountedTotalPrice?: number;
  lines?: MindboxOrderLine[];
  payments?: MindboxPayment[];
  customer?: MindboxCustomer;
}

export interface MindboxOrderLine {
  product?: { ids?: Record<string, string>; name?: string };
  quantity?: number;
  basePricePerItem?: number;
  discountedPriceOfLine?: number;
}

export interface MindboxPayment {
  type?: string;
  amount?: number;
}

export interface MindboxSegment {
  ids?: Record<string, string>;
  name?: string;
  customerCount?: number;
}

export interface MindboxValidationMessage {
  message?: string;
  location?: string;
}

export interface MindboxOperationResponse {
  status: string;
  customer?: MindboxCustomer;
  order?: MindboxOrder;
  customerSegmentations?: MindboxSegmentationGroup[];
  products?: unknown[];
  productList?: unknown[];
  totalCount?: number;
  errorId?: string;
  errorMessage?: string;
  validationMessages?: MindboxValidationMessage[];
}

export interface MindboxSegmentationGroup {
  segmentation?: { ids?: Record<string, string>; name?: string };
  segment?: MindboxSegment;
}
