export interface MegaplanTask {
  id: string;
  name: string;
  description?: string;
  status: string;
  responsible?: { id: string; name: string };
  deadline?: string;
  priority?: string;
  created: string;
  modified: string;
}

export interface MegaplanDeal {
  id: string;
  name: string;
  status: string;
  amount?: number;
  responsible?: { id: string; name: string };
  contact?: { id: string; name: string };
  created: string;
  modified: string;
}

export interface MegaplanProject {
  id: string;
  name: string;
  status: string;
  responsible?: { id: string; name: string };
  created: string;
  modified: string;
}

export interface MegaplanEmployee {
  id: string;
  name: string;
  email?: string;
  department?: { id: string; name: string };
  position?: string;
}

export interface MegaplanComment {
  id: string;
  text: string;
  author?: { id: string; name: string };
  created: string;
}

export interface MegaplanListResult<T> {
  meta: { totalCount: number; limit: number; offset: number };
  data: T[];
}
