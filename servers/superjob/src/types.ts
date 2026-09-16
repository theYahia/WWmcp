export interface SJVacancy {
  id: number;
  profession: string;
  payment_from: number;
  payment_to: number;
  currency: string;
  town: { id: number; title: string };
  firm_name: string;
  link: string;
  date_published: number;
  experience: { id: number; title: string };
  type_of_work: { id: number; title: string };
}

export interface SJSearchResult {
  objects: SJVacancy[];
  total: number;
  more: boolean;
}
