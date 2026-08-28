export interface DellinCity {
  cityID: number;
  name: string;
  code: string;
  region: string;
  regCode?: string;
  searchString?: string;
}

export interface DellinCalcResult {
  data?: {
    price: number;
    premium_price?: number;
    intercity?: {
      price: number;
      delivery_time_from: number;
      delivery_time_to: number;
    };
    small_cargo?: {
      price: number;
      delivery_time_from: number;
      delivery_time_to: number;
    };
    air?: {
      price: number;
      delivery_time_from: number;
      delivery_time_to: number;
    };
    express?: {
      price: number;
      delivery_time_from: number;
      delivery_time_to: number;
    };
  };
  metadata?: {
    status: number;
    generated_at: string;
  };
}

export interface DellinTrackingResult {
  data?: Array<{
    orderNumber: string;
    orderId: string;
    state: string;
    stateName: string;
    orderDate: string;
    derivalDate?: string;
    arrivalDate?: string;
    deliveryDate?: string;
    senderCity?: string;
    receiverCity?: string;
    documents?: Array<{
      id: string;
      type: string;
      state: string;
      stateName: string;
    }>;
  }>;
}

export interface DellinError {
  errors?: Array<{
    title: string;
    detail?: string;
  }>;
}
