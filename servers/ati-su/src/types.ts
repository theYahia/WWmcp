/**
 * ATI.su API types — modelled on the REAL API surface.
 *
 * Casing is intentional and varies by API generation:
 *   - v1.0 read endpoints (loads, single firm) return PascalCase.
 *   - v2 (/v2/cargos) and firm-search return snake_case.
 *   - /gw/* gateway services return snake_case.
 *
 * Response fields are optional because ATI omits empties and some shapes are
 * only doc-verified (no live token). Mappers read these defensively. Fields tagged
 * TODO(verify) could not be confirmed without a live token / fuller OpenAPI read.
 */

export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Loads — v1.0 single-load read (GET /v1.0/loads/{id}, PascalCase)
// Source: api.ati.su/help/32018204.html
// ---------------------------------------------------------------------------

export interface V1LoadPlace {
  CityId?: number;
  Latitude?: number;
  Longitude?: number;
  Street?: string;
  TimeStart?: string;
  TimeEnd?: string;
}

export interface V1LoadCargo {
  Weight?: number;
  Volume?: number;
  CargoTypeId?: number;
  CargoType?: string;
  ADR?: number;
  PackType?: number;
  PalletCount?: number;
}

export interface V1LoadPayment {
  CurrencyId?: number;
  RateSum?: number;
  SumWithNDS?: number;
  SumWithoutNDS?: number;
  FixedRate?: boolean;
  Torg?: boolean;
}

export interface V1Load {
  Id?: number | string;
  FirmId?: number;
  Distance?: number;
  FirstDate?: string;
  LastDate?: string;
  DateType?: number;
  ContactId1?: number;
  ContactId2?: number;
  Note?: string;
  AddedAt?: string;
  UpdatedAt?: string;
  Loading?: V1LoadPlace;
  Unloading?: V1LoadPlace;
  Cargo?: V1LoadCargo;
  Payment?: V1LoadPayment;
  // search/byboards adds: LoadNumber, TravelTime, TollRoadsLength, PlatonRoadsLength
  [key: string]: unknown;
}

/** GET /v1.0/loads returns an array of loads (own loads, filtered client-side by contact_id). */
export type V1LoadsResponse = V1Load[] | { loads?: V1Load[] };

// ---------------------------------------------------------------------------
// Loads — v2 create (POST /v2/cargos, snake_case)
// Source: ati.su/developers/api/loads/published/
// Request is wrapped as { cargo_application: CargoApplicationInput }.
// ---------------------------------------------------------------------------

export interface CargoApplicationResponse {
  cargo_application_id?: string; // uuid
  cargo_application_number?: string;
  added_at?: string;
  updated_at?: string;
  is_published?: boolean;
  is_archived?: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Firms (GET /v1.0/firms/{atiId}/summary; GET /v1.0/firms/search/summary)
// snake_case. TODO(verify): by-id summary schema sits behind an interactive
// constructor; field set below is from firm-search + contacts-summary siblings.
// ---------------------------------------------------------------------------

export interface FirmLocation {
  city_id?: number;
  region_id?: number;
  country_id?: number;
}

export interface FirmSummary {
  ati_id?: number;
  inn?: string;
  ogrn?: string;
  full_name?: string;
  firm_type?: string;
  firm_type_id?: number;
  address?: string;
  web_site?: string;
  /** Star rating; a NEGATIVE value means "red stars" (bad reputation). */
  score?: number;
  claims_count?: number;
  recommendations_count?: number;
  bad_partner_mentions_count?: number;
  negative_points_sum?: number;
  verified_trucks?: number;
  last_month_active_days?: number;
  registration_date?: string;
  contact_names?: string[];
  location?: FirmLocation;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Trucks (GET /v1.1/trucks, GET /v1.1/trucks/{id}) — own fleet.
// TODO(verify): the full truck object schema is NOT in the public OpenAPI
// (that file only documents counter-offers). Kept permissive until confirmed.
// ---------------------------------------------------------------------------

export interface Truck {
  id?: string;
  [key: string]: unknown;
}

export type TrucksResponse = Truck[] | { trucks?: Truck[] };

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

/** GET /v1.0/dictionaries/carTypes (body types) and /cargoTypes (cargo types). */
export interface DictionaryItem {
  Id?: number;
  Id2?: string; // guid
  Name?: string;
  NameEng?: string;
  ShortName?: string;
  ShortNameEng?: string;
}

/**
 * POST /v1.0/dictionaries/locations/parse — name → city id geocoding.
 * TODO(verify): exact request/response shape (community-confirmed endpoint).
 */
export interface ParsedLocation {
  city_id?: number;
  name?: string;
  region_id?: number;
  country_id?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Distance (paid) — POST /gw/gis-rm/v1/distance
// Source: ati.su/developers/paid-api/route/
// ---------------------------------------------------------------------------

export interface DistanceResponse {
  total_distance?: number; // meters
  travel_time?: number; // seconds
  platon_distance?: number;
  toll_distance?: number;
  status?: unknown;
  [key: string]: unknown;
}
