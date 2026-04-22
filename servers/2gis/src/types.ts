/**
 * 2GIS API response types.
 */

export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
}

// Search
export interface SearchResponse {
  meta: {
    code: number;
    api_version: string;
  };
  result: {
    total: number;
    items: SearchItem[];
  };
}

export interface SearchItem {
  id: string;
  type: string;
  name: string;
  full_name?: string;
  address_name?: string;
  purpose_name?: string;
  building_name?: string;
  point?: { lat: number; lon: number };
  address?: {
    building_id?: string;
    components?: Array<{ type: string; name: string }>;
    postcode?: string;
  };
  org?: {
    id: string;
    name: string;
    branch_count?: number;
  };
  contact_groups?: Array<{
    contacts: Array<{
      type: string;
      value: string;
      text?: string;
    }>;
  }>;
  schedule?: {
    Mon?: string;
    Tue?: string;
    Wed?: string;
    Thu?: string;
    Fri?: string;
    Sat?: string;
    Sun?: string;
  };
  rubrics?: Array<{
    id: string;
    name: string;
    parent_id?: string;
  }>;
  reviews?: {
    general_rating?: number;
    general_review_count?: number;
  };
  external_content?: Array<{
    type: string;
    count?: number;
    main_photo_url?: string;
  }>;
}

// Geocode
export interface GeocodeResponse {
  meta: { code: number };
  result: {
    total: number;
    items: Array<{
      id: string;
      name: string;
      full_name: string;
      point: { lat: number; lon: number };
      address: {
        building_id?: string;
        postcode?: string;
        components: Array<{ type: string; name: string }>;
      };
      type: string;
    }>;
  };
}

// Directions
export interface DirectionsResponse {
  meta: { code: number };
  result: Array<{
    id: string;
    type: string;
    begin_pedestrian_path?: unknown;
    end_pedestrian_path?: unknown;
    total_duration: number;
    total_distance: number;
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        type: string;
        text?: string;
        distance?: number;
        duration?: number;
      }>;
    }>;
  }>;
}

// Suggest
export interface SuggestResponse {
  meta: { code: number };
  result: {
    items: Array<{
      id?: string;
      title: string;
      subtitle?: string;
      type: string;
      point?: { lat: number; lon: number };
    }>;
  };
}

// Reviews
export interface ReviewsResponse {
  meta: { code: number };
  result: {
    items: Array<{
      id: string;
      text?: string;
      rating: number;
      date_created: string;
      user?: { name: string };
    }>;
    total: number;
  };
}
