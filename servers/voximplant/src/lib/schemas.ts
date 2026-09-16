import { z } from "zod";
import { isValidDateTime } from "./dates.js";

/** Дата-время в формате Voximplant "YYYY-MM-DD HH:mm:ss" (UTC). */
export const dateTime = (description: string) =>
  z.string().refine(isValidDateTime, "Ожидается формат YYYY-MM-DD HH:mm:ss (UTC)").describe(description);

/** Количество записей (1..max). */
export const count = (def: number, max = 200) =>
  z.number().int().min(1).max(max).default(def).describe(`Количество записей (1..${max})`);

/** Смещение для пагинации. */
export const offset = () => z.number().int().min(0).default(0).describe("Смещение (offset)");

/**
 * Номер-получатель. Намеренно НЕ навязываем жёсткий E.164-regex: API — финальный
 * валидатор, а получатель может быть в локальном формате (8XXX...), и над-валидация
 * отвергла бы валидные входы. Подсказку по формату даём в описании.
 * ВНИМАНИЕ: НЕ применять к полю `source` SMS — там допустим буквенный sender ID.
 */
export const phoneNumber = (description: string) => z.string().min(1).describe(description);
