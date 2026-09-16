/**
 * DaData API response types.
 *
 * Only fields we actually use are typed — DaData returns 80+ fields for
 * addresses but we filter down to the essential subset to reduce token
 * usage when AI agents consume the output.
 */

// ---------------------------------------------------------------------------
// Generic wrapper
// ---------------------------------------------------------------------------

export interface DaDataSuggestion<T> {
  value: string;
  unrestricted_value: string;
  data: T;
}

export interface SuggestResponse<T> {
  suggestions: DaDataSuggestion<T>[];
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export interface AddressData {
  postal_code: string | null;
  country: string | null;
  country_iso_code: string | null;
  region_with_type: string | null;
  region_fias_id: string | null;
  city_with_type: string | null;
  city_fias_id: string | null;
  settlement_with_type: string | null;
  street_with_type: string | null;
  house: string | null;
  flat: string | null;
  fias_id: string | null;
  fias_level: string | null;
  kladr_id: string | null;
  geo_lat: string | null;
  geo_lon: string | null;
  qc_geo: number | null;
  timezone: string | null;
}

// ---------------------------------------------------------------------------
// Company (party)
// ---------------------------------------------------------------------------

export interface PartyName {
  full_with_opf: string | null;
  short_with_opf: string | null;
  full: string | null;
  short: string | null;
}

export interface PartyState {
  status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED" | "BANKRUPT" | "REORGANIZING";
  registration_date: number | null;
  liquidation_date: number | null;
}

export interface PartyManagement {
  name: string;
  post: string;
}

export interface PartyOpf {
  code: string;
  full: string;
  short: string;
}

export interface PartyFinance {
  tax_system: string | null;
  income: number | null;
  expense: number | null;
  debt: number | null;
  penalty: number | null;
}

export interface PartyData {
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  ogrn_date: number | null;
  type: "LEGAL" | "INDIVIDUAL";
  name: PartyName;
  opf: PartyOpf | null;
  state: PartyState;
  management: PartyManagement | null;
  address: DaDataSuggestion<AddressData> | null;
  okved: string | null;
  okved_type: string | null;
  employee_count: number | null;
  branch_count: number | null;
  branch_type: "MAIN" | "BRANCH" | null;
  finance: PartyFinance | null;
}

// ---------------------------------------------------------------------------
// Bank
// ---------------------------------------------------------------------------

export interface BankName {
  payment: string | null;
  full: string | null;
  short: string | null;
}

export interface BankState {
  status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED";
  registration_date: number | null;
}

export interface BankOpf {
  type: "CBR" | "BANK" | "NKO" | "BANK_BRANCH" | "NKO_BRANCH" | "OTHER";
}

export interface BankData {
  bic: string | null;
  swift: string | null;
  inn: string | null;
  kpp: string | null;
  registration_number: string | null;
  correspondent_account: string | null;
  name: BankName;
  address: { value: string } | null;
  state: BankState;
  opf: BankOpf | null;
}

// ---------------------------------------------------------------------------
// Cleaner responses
// ---------------------------------------------------------------------------

export interface CleanAddressResult {
  source: string;
  result: string;
  postal_code: string | null;
  region_with_type: string | null;
  city_with_type: string | null;
  street_with_type: string | null;
  house: string | null;
  flat: string | null;
  geo_lat: string | null;
  geo_lon: string | null;
  fias_id: string | null;
  kladr_id: string | null;
  qc: number;
  qc_geo: number;
  qc_complete: number;
  qc_house: number;
  timezone: string | null;
  metro: Array<{ name: string; line: string; distance: number }> | null;
  unparsed_parts: string | null;
}

export interface CleanPhoneResult {
  source: string;
  type: string;
  phone: string;
  country_code: string;
  city_code: string;
  number: string;
  extension: string;
  provider: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  qc_conflict: number;
  qc: number;
}

// ---------------------------------------------------------------------------
// Clean email
// ---------------------------------------------------------------------------

export interface CleanEmailResult {
  source: string;
  email: string;
  local: string;
  domain: string;
  type: "PERSONAL" | "CORPORATE" | "ROLE" | "DISPOSABLE" | null;
  qc: number;
}

// ---------------------------------------------------------------------------
// Clean name (FIO)
// ---------------------------------------------------------------------------

export interface CleanNameResult {
  source: string;
  result: string;
  result_genitive: string | null;
  result_dative: string | null;
  result_ablative: string | null;
  surname: string | null;
  name: string | null;
  patronymic: string | null;
  gender: "М" | "Ж" | "НД" | null;
  qc: number;
}

// ---------------------------------------------------------------------------
// FIO suggestion data
// ---------------------------------------------------------------------------

export interface FioData {
  surname: string | null;
  name: string | null;
  patronymic: string | null;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Delivery city (CDEK/Boxberry/DPD IDs)
// ---------------------------------------------------------------------------

export interface DeliveryData {
  kladr_id: string | null;
  fias_id: string | null;
  boxberry_id: string | null;
  cdek_id: string | null;
  dpd_id: string | null;
}

// ---------------------------------------------------------------------------
// Clean passport
// ---------------------------------------------------------------------------

export interface CleanPassportResult {
  source: string;
  series: string | null;
  number: string | null;
  qc: number;
}

// ---------------------------------------------------------------------------
// FMS unit (passport issuer)
// ---------------------------------------------------------------------------

export interface FmsUnitData {
  code: string | null;
  name: string | null;
  region_code: string | null;
  type: string | null;
}

// ---------------------------------------------------------------------------
// Country
// ---------------------------------------------------------------------------

export interface CountryData {
  code: string | null;
  alfa2: string | null;
  alfa3: string | null;
  name_short: string | null;
  name: string | null;
}

// ---------------------------------------------------------------------------
// Email suggestion data
// ---------------------------------------------------------------------------

export interface EmailData {
  local: string | null;
  domain: string | null;
  type: string | null;
  source: string | null;
  qc: number | null;
}

// ---------------------------------------------------------------------------
// Postal unit
// ---------------------------------------------------------------------------

export interface PostalUnitData {
  postal_code: string | null;
  is_closed: boolean | null;
  type_code: string | null;
  address_str: string | null;
  address_kladr_id: string | null;
  schedule_mon: string | null;
  schedule_tue: string | null;
  schedule_wed: string | null;
  schedule_thu: string | null;
  schedule_fri: string | null;
  schedule_sat: string | null;
  schedule_sun: string | null;
  geo_lat: number | null;
  geo_lon: number | null;
}

// ---------------------------------------------------------------------------
// Car brand
// ---------------------------------------------------------------------------

export interface CarBrandData {
  id: string | null;
  name: string | null;
  name_ru: string | null;
}

// ---------------------------------------------------------------------------
// Reference data (OKVED, OKPD, currency, metro, fns, fts, court, etc.)
// ---------------------------------------------------------------------------

export interface ReferenceData {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Affiliated party
// ---------------------------------------------------------------------------

export interface AffiliatedPartyData extends PartyData {
  // Same as PartyData with additional affiliation context
}

// ---------------------------------------------------------------------------
// Brand data
// ---------------------------------------------------------------------------

export interface BrandData {
  name: string | null;
  site: string | null;
  logo: string | null;
}

// ---------------------------------------------------------------------------
// Clean vehicle
// ---------------------------------------------------------------------------

export interface CleanVehicleResult {
  source: string;
  result: string | null;
  brand: string | null;
  model: string | null;
  qc: number;
}

// ---------------------------------------------------------------------------
// Profile / Balance
// ---------------------------------------------------------------------------

export interface BalanceResponse {
  balance: number;
}

// ---------------------------------------------------------------------------
// IP Locate
// ---------------------------------------------------------------------------

export interface IpLocateResponse {
  location: DaDataSuggestion<AddressData> | null;
}

// ---------------------------------------------------------------------------
// API call result (internal)
// ---------------------------------------------------------------------------

export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
}
