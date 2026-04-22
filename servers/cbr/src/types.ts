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
