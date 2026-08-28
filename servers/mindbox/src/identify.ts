/** Сообщение, когда не передан ни один идентификатор клиента. */
export const NO_IDENTIFIER_MSG =
  "Укажите хотя бы один идентификатор клиента: email, phone или external_id.";

export interface CustomerIdentifiers {
  email?: string;
  phone?: string;
  external_id?: string;
}

/**
 * Записать идентификаторы клиента (email/mobilePhone/ids.externalId) в объект customer.
 * Возвращает true, если задан хотя бы один идентификатор — иначе вызывающий код
 * должен вернуть NO_IDENTIFIER_MSG, не отправляя пустого клиента в Mindbox.
 *
 * Единый guard для get_customer / get_segments / update_customer / create_order.
 */
export function applyIdentifiers(
  customer: Record<string, unknown>,
  ids: CustomerIdentifiers,
): boolean {
  if (ids.email) customer.email = ids.email;
  if (ids.phone) customer.mobilePhone = ids.phone;
  if (ids.external_id) customer.ids = { externalId: ids.external_id };
  return Boolean(ids.email || ids.phone || ids.external_id);
}
