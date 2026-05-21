/**
 * Avito API type stubs.
 *
 * These mirror only the fields we actually surface in tool responses.
 * The Avito schema is large; we intentionally don't model every field.
 * Sources: developers.avito.ru API catalog (Items, Messenger).
 */

/** Status values for a seller's item (per /core/v1/items). */
export type AvitoItemStatus = "active" | "old" | "blocked" | "rejected" | "removed";

export interface AvitoItemSummary {
  id: number;
  title?: string;
  status?: AvitoItemStatus;
  category?: { id?: number; name?: string };
  url?: string;
  price?: number;
  /** Avito uses RFC3339 strings */
  date?: string;
}

export interface AvitoListItemsResponse {
  resources?: AvitoItemSummary[];
  meta?: { page?: number; per_page?: number };
}

export interface AvitoItemDetail extends AvitoItemSummary {
  description?: string;
  address?: string;
  /** Statistics may include `views`, `contacts`, etc. */
  stats?: Record<string, unknown>;
  services?: unknown[];
}

export interface AvitoChat {
  id: string;
  /** Chat type — "u2i" (user-to-item), "u2u", etc. */
  type?: string;
  created?: number;
  updated?: number;
  users?: Array<{ id: number; name?: string; public_user_profile?: unknown }>;
  context?: {
    type?: string;
    value?: { id?: number; title?: string; price_string?: string; url?: string };
  };
  last_message?: {
    id?: string;
    direction?: "in" | "out";
    type?: string;
    content?: Record<string, unknown>;
    created?: number;
  };
}

export interface AvitoListChatsResponse {
  chats?: AvitoChat[];
}
