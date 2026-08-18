export interface TravelpayoutsFlight {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  duration: number;
  duration_to?: number;
  duration_back?: number;
  link: string;
}

export interface TravelpayoutsSpecialOffer {
  origin: string;
  destination: string;
  origin_name?: string;
  destination_name?: string;
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  link: string;
}

export interface TravelpayoutsCalendarPrice {
  origin: string;
  destination: string;
  price: number;
  airline: string;
  flight_number?: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  duration?: number;
  link?: string;
}

export interface TravelpayoutsError {
  error?: string;
  message?: string;
}
