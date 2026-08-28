export interface KaspiOrder {
  id: string;
  type: string;
  attributes: {
    code: string;
    totalPrice: number;
    paymentMode: string;
    deliveryMode: string;
    signatureRequired?: boolean;
    creationDate: string;
    deliveryCostForSeller?: number;
    isKaspiDelivery?: boolean;
    deliveryAddress?: {
      formattedAddress: string;
      latitude?: number;
      longitude?: number;
    };
    state: string;
    status: string;
    customer?: {
      id: string;
      name: string;
      cellPhone: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface KaspiProduct {
  id: string;
  type: string;
  attributes: {
    masterProduct: {
      sku: string;
      name: string;
      manufacturer?: string;
    };
    sku: string;
    price: number;
    isActive: boolean;
    availabilityStatus?: string;
  };
}

export interface KaspiJsonApiResponse {
  data: KaspiOrder[] | KaspiOrder | KaspiProduct[];
  included?: unknown[];
  meta?: {
    pageCount?: number;
    totalCount?: number;
  };
}

export interface KaspiError {
  errors?: Array<{
    status: string;
    title: string;
    detail?: string;
  }>;
}
