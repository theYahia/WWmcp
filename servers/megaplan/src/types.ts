// Compact, LLM-friendly shapes produced by src/format.ts.
// These intentionally describe our *formatted* output (not the raw, verbose
// Megaplan v3 entities), so most fields are optional/nullable: the v3 API
// returns nested ref objects and the exact field set varies by account.

export interface MegaplanTask {
  id: string;
  name?: string;
  status?: string | null;
  responsible?: string | null;
  deadline?: string | null;
  priority?: string | null;
  created?: string | null;
  modified?: string | null;
}

export interface MegaplanDeal {
  id: string;
  name?: string;
  status?: string | null;
  price?: string | null;
  cost?: string | null;
  responsible?: string | null;
  contact?: string | null;
  contractor?: string | null;
  created?: string | null;
  modified?: string | null;
}

export interface MegaplanProject {
  id: string;
  name?: string;
  status?: string | null;
  responsible?: string | null;
  created?: string | null;
  modified?: string | null;
}

export interface MegaplanEmployee {
  id: string;
  name?: string;
  email?: string | null;
  department?: string | null;
  position?: string | null;
}

export interface MegaplanComment {
  id: string;
  content?: string | null;
  author?: string | null;
  created?: string | null;
}

export interface MegaplanProgram {
  id: string;
  name?: string;
}

export interface MegaplanClient {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  type?: string | null;
}

export interface MegaplanListSummary<T> {
  total: number;
  count: number;
  items: T[];
  nextPageAfter: string | null;
}
