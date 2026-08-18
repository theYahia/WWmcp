import { z } from "zod";
import { getInvestClient } from "../invest-client.js";

export const getPortfolioSchema = z.object({
  account_id: z.string()
    .describe("ID брокерского счёта (получить через T-Инвестиции → Профиль)"),
  currency: z.enum(["RUB", "USD", "EUR", "UNSPECIFIED"]).default("RUB")
    .describe("Валюта для агрегирования итогов портфеля"),
});

export const findInstrumentSchema = z.object({
  query: z.string()
    .describe("Тикер, ISIN или название компании (напр. SBER, US0231351067, Сбербанк)"),
  instrument_kind: z.enum([
    "INSTRUMENT_TYPE_UNSPECIFIED",
    "INSTRUMENT_TYPE_SHARE",
    "INSTRUMENT_TYPE_BOND",
    "INSTRUMENT_TYPE_ETF",
    "INSTRUMENT_TYPE_CURRENCY",
  ]).default("INSTRUMENT_TYPE_UNSPECIFIED")
    .describe("Фильтр по типу инструмента"),
  api_trade_available_flag: z.boolean().default(true)
    .describe("Только инструменты, доступные для торговли через API"),
});

export async function handleGetPortfolio(
  params: z.infer<typeof getPortfolioSchema>
): Promise<string> {
  const client = getInvestClient();
  const result = await client.post(
    "/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio",
    {
      accountId: params.account_id,
      currency: params.currency === "UNSPECIFIED"
        ? "PORTFOLIO_CURRENCY_UNSPECIFIED"
        : params.currency,
    }
  );
  return JSON.stringify(result, null, 2);
}

export async function handleFindInstrument(
  params: z.infer<typeof findInstrumentSchema>
): Promise<string> {
  const client = getInvestClient();
  const result = await client.post(
    "/tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument",
    {
      query: params.query,
      instrumentKind: params.instrument_kind,
      apiTradeAvailableFlag: params.api_trade_available_flag,
    }
  );
  return JSON.stringify(result, null, 2);
}
