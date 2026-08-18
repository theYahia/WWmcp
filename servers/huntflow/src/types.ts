import { z } from "zod";

// Курируемые zod-схемы сущностей Huntflow.
// Все поля optional/nullable + .passthrough() — схемы используются как outputSchema
// тулов: они должны валидировать и курированный subset, и сырой ответ (флаг raw),
// поэтому максимально толерантны и при этом документируют ключевые поля.

const id = z.number().optional();
const str = z.union([z.string(), z.number()]).nullish();

export const HFVacancy = z
  .object({
    id,
    position: z.string().nullish(),
    company: str,
    money: str,
    state: z.string().nullish(),
    created: z.string().nullish(),
    priority: z.number().nullish(),
  })
  .passthrough();

export const HFApplicant = z
  .object({
    id,
    first_name: z.string().nullish(),
    last_name: z.string().nullish(),
    middle_name: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    position: z.string().nullish(),
    created: z.string().nullish(),
  })
  .passthrough();

export const HFResume = z
  .object({
    id,
    auth_type: z.string().nullish(),
    account_source: z.number().nullish(),
    created: z.string().nullish(),
    updated: z.string().nullish(),
  })
  .passthrough();

export const HFStage = z
  .object({
    id,
    name: z.string().nullish(),
    type: z.string().nullish(),
    order: z.number().nullish(),
    removed: z.boolean().nullish(),
  })
  .passthrough();

export const HFAccount = z
  .object({
    id,
    name: z.string().nullish(),
    nick: z.string().nullish(),
    member_type: z.string().nullish(),
  })
  .passthrough();

export const HFCoworker = z
  .object({
    id,
    name: z.string().nullish(),
    type: z.string().nullish(),
    email: z.string().nullish(),
  })
  .passthrough();

export const HFDictItem = z
  .object({
    id,
    name: z.string().nullish(),
    type: z.string().nullish(),
    foreign: z.string().nullish(),
    order: z.number().nullish(),
  })
  .passthrough();

export type THFVacancy = z.infer<typeof HFVacancy>;
export type THFApplicant = z.infer<typeof HFApplicant>;
export type THFResume = z.infer<typeof HFResume>;
export type THFStage = z.infer<typeof HFStage>;
export type THFAccount = z.infer<typeof HFAccount>;
