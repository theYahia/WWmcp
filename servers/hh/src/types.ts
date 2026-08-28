export interface Vacancy {
  id: string;
  name: string;
  salary?: { from?: number; to?: number; currency: string; gross: boolean };
  employer: { id: string; name: string; url?: string; alternate_url?: string };
  area: { id: string; name: string };
  snippet?: { requirement?: string; responsibility?: string };
  alternate_url: string;
  published_at: string;
  experience?: { id: string; name: string };
  employment?: { id: string; name: string };
  schedule?: { id: string; name: string };
}

export interface VacancyDetail extends Vacancy {
  description: string;
  key_skills: { name: string }[];
  contacts?: {
    name?: string;
    email?: string;
    phones?: { number: string }[];
  };
}

export interface Employer {
  id: string;
  name: string;
  url: string;
  alternate_url: string;
  open_vacancies: number;
  area?: { id: string; name: string };
  description?: string;
  site_url?: string;
  industries?: { id: string; name: string }[];
}

export interface Resume {
  id: string;
  title: string;
  url: string;
  alternate_url: string;
  area?: { id: string; name: string };
  salary?: { amount: number; currency: string };
  age?: number;
  gender?: { id: string; name: string };
  experience?: {
    company?: string;
    position?: string;
    start: string;
    end?: string;
  }[];
  total_experience?: { months: number };
  education?: {
    level?: { id: string; name: string };
    primary?: { name: string; year: number; organization: string }[];
  };
  skill_set?: string[];
}

export interface Area {
  id: string;
  name: string;
  areas?: Area[];
}

export interface ProfessionalRole {
  id: string;
  name: string;
  roles?: { id: string; name: string }[];
}

export interface SearchResult<T> {
  items: T[];
  found: number;
  pages: number;
  per_page: number;
  page: number;
}

export interface SuggestItem {
  id: string;
  text: string;
}
