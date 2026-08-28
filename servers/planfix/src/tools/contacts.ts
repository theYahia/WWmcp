import { z } from "zod";
import { planfixPost, planfixGet } from "../client.js";
import { formatContactList, formatSingleContact, formatCreated, formatUpdated } from "../format.js";

const CONTACT_FIELDS = "id,name,midname,lastname,email,phones,company";

export const getContactsSchema = z.object({
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество контактов на странице (по умолчанию 100)"),
  filterId: z.union([z.string(), z.number()]).optional().describe("ID сохранённого фильтра контактов"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${CONTACT_FIELDS})`),
});

export async function handleGetContacts(params: z.infer<typeof getContactsSchema>): Promise<string> {
  const offset = params.offset ?? 0;
  const pageSize = params.pageSize ?? 100;
  const result = await planfixPost("contact/list", {
    offset,
    pageSize,
    fields: params.fields ?? CONTACT_FIELDS,
    ...(params.filterId !== undefined ? { filterId: String(params.filterId) } : {}),
  });
  return formatContactList(result, pageSize, offset);
}

export const getContactSchema = z.object({
  contactId: z.number().describe("ID контакта"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${CONTACT_FIELDS})`),
});

export async function handleGetContact(params: z.infer<typeof getContactSchema>): Promise<string> {
  const result = await planfixGet(`contact/${params.contactId}`, { fields: params.fields ?? CONTACT_FIELDS });
  return formatSingleContact(result);
}

export const createContactSchema = z.object({
  name: z.string().describe("Имя контакта (или название компании)"),
  email: z.string().optional().describe("Email"),
  phone: z.string().optional().describe("Телефон"),
  companyId: z.number().optional().describe("ID компании, к которой привязать контакт"),
  isCompany: z.boolean().optional().describe("true — создать компанию вместо персоны"),
});

export async function handleCreateContact(params: z.infer<typeof createContactSchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name };
  if (params.email) body.email = params.email;
  if (params.phone) body.phones = [{ number: params.phone }];
  if (params.companyId) body.company = { id: params.companyId };
  if (params.isCompany !== undefined) body.isCompany = params.isCompany;

  const result = await planfixPost("contact/", body);
  return formatCreated("Контакт", result);
}

export const updateContactSchema = z.object({
  contactId: z.number().describe("ID контакта"),
  name: z.string().optional().describe("Новое имя"),
  email: z.string().optional().describe("Новый email"),
  phone: z.string().optional().describe("Новый телефон"),
});

export async function handleUpdateContact(params: z.infer<typeof updateContactSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.name) body.name = params.name;
  if (params.email) body.email = params.email;
  if (params.phone) body.phones = [{ number: params.phone }];

  await planfixPost(`contact/${params.contactId}`, body);
  return formatUpdated("Контакт", params.contactId);
}
