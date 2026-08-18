/** Core company info returned by /req */
export interface CompanyReqResult {
  inn: string;
  ogrn: string;
  focusHref: string;
  briefReport?: BriefReportData;
  UL?: LegalEntity;
  IP?: IndividualEntrepreneur;
}

export interface LegalEntity {
  legalName?: { short?: string; full?: string };
  legalAddress?: { parsedAddressRF?: ParsedAddress };
  status?: { statusString?: string; date?: string };
  heads?: Head[];
  foundersFL?: FounderFL[];
  foundersUL?: FounderUL[];
  registrationDate?: string;
  kpp?: string;
}

export interface IndividualEntrepreneur {
  fio?: string;
  status?: { statusString?: string; date?: string };
  registrationDate?: string;
}

export interface ParsedAddress {
  regionName?: { topoValue?: string };
  city?: { topoValue?: string };
  street?: { topoValue?: string };
  house?: { topoValue?: string };
  bulk?: { topoValue?: string };
  flat?: { topoValue?: string };
  zipCode?: string;
}

export interface Head {
  fio?: string;
  innfl?: string;
  position?: string;
}

export interface FounderFL {
  fio?: string;
  innfl?: string;
  share?: ShareInfo;
}

export interface FounderUL {
  legalName?: { short?: string };
  inn?: string;
  share?: ShareInfo;
}

export interface ShareInfo {
  percentagePlain?: number;
  percentageNominal?: number;
  sum?: number;
}

/** Brief report from /briefReport */
export interface BriefReportResult {
  inn: string;
  ogrn: string;
  focusHref: string;
  briefReport?: BriefReportData;
}

export interface BriefReportData {
  summary?: { greenStatements?: boolean; yellowStatements?: boolean; redStatements?: boolean };
  href?: string;
}

/** Analytics from /analytics */
export interface AnalyticsResult {
  inn: string;
  ogrn: string;
  analytics?: AnalyticsData;
}

export interface AnalyticsData {
  s1001?: number; // revenue
  s2100?: number; // gross profit
  s2200?: number; // operating profit
  s2400?: number; // net profit
  s1600?: number; // total assets
  s1300?: number; // equity
  s1700?: number; // total liabilities
}

/** Counterparty check from /counterparties */
export interface CounterpartyResult {
  inn: string;
  ogrn: string;
  focusHref: string;
  counterparty?: CounterpartyData;
}

export interface CounterpartyData {
  greenStatements?: StatementGroup;
  yellowStatements?: StatementGroup;
  redStatements?: StatementGroup;
}

export interface StatementGroup {
  statements?: Statement[];
}

export interface Statement {
  name?: string;
  description?: string;
}
