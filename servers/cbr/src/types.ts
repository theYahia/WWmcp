export interface CbrDailyResponse {
  Date: string;
  PreviousDate: string;
  PreviousURL: string;
  Timestamp: string;
  Valute: Record<string, CbrCurrency>;
}

export interface CbrCurrency {
  ID: string;
  NumCode: string;
  CharCode: string;
  Nominal: number;
  Name: string;
  Value: number;
  Previous: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  nominal: number;
  rate: number;
  previous_rate: number;
  change: number;
  change_percent: number;
  date: string;
}

export interface ConversionResult {
  amount: number;
  from: string;
  to: string;
  result: number;
  from_rate: number;
  to_rate: number;
  date: string;
}

/** Точка ряда ключевой ставки: дата и значение в %. */
export interface KeyRatePoint {
  date: string;
  rate: number;
}

export interface KeyRateInfo {
  rate: number;
  /** Дата, на которую актуальна ставка (последняя в ряду). */
  date: string;
  /** Дата, с которой действует текущая ставка. */
  since: string;
}

/** Точка ряда динамики курса валюты. */
export interface DynamicsPoint {
  date: string;
  nominal: number;
  /** Курс за `nominal` единиц валюты. */
  value: number;
  /** Курс за 1 единицу валюты (VunitRate). */
  rate: number;
}
