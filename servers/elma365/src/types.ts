export interface ElmaAppItem {
  __id: string;
  __name?: string;
  __createdAt?: string;
  __updatedAt?: string;
  __createdBy?: { __id: string; __name: string };
  [key: string]: unknown;
}

export interface ElmaTask {
  id: string;
  subject?: string;
  description?: string;
  status?: string;
  assignee?: { __id: string; __name: string };
  createdAt?: string;
  dueDate?: string;
}

export interface ElmaProcess {
  id: string;
  code?: string;
  name?: string;
  status?: string;
  createdAt?: string;
}

export interface ElmaUser {
  __id: string;
  __name?: string;
  email?: string;
  position?: string;
  department?: string;
}

export interface ElmaComment {
  __id: string;
  text?: string;
  author?: { __id: string; __name: string };
  createdAt?: string;
}
