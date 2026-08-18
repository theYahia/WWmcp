export interface BoxberryCity {
  Code: string;
  Name: string;
  Region: string;
  CountryCode: string;
  Prefix: string;
  ReceptionLaP: string;
  DeliveryLaP: string;
  Reception: string;
  ForeignReceptionReturns: string;
  Terminal: string;
  Kladr: string;
  UniqName: string;
}

export interface BoxberryPoint {
  Code: string;
  Name: string;
  Address: string;
  Phone: string;
  WorkSchedule: string;
  TripDescription: string;
  DeliveryPeriod: number;
  CityCode: string;
  CityName: string;
  Area: string;
  Country: string;
  GPS: string;
  AddressReduce: string;
}

export interface BoxberryDeliveryCalc {
  price: number;
  price_base: number;
  price_service: number;
  delivery_period: number;
}

export interface BoxberryTracking {
  Date: string;
  Name: string;
  Comment: string;
}

export interface BoxberryError {
  err?: string;
  ErrCode?: number;
}
