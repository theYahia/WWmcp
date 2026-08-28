export interface TildaProject {
  id: string;
  title: string;
  descr?: string;
  customdomain?: string;
}

export interface TildaPage {
  id: string;
  projectid: string;
  title: string;
  descr?: string;
  alias?: string;
  filename?: string;
  date?: string;
  sort?: string;
  published?: string;
}

// Tilda returns css/js as a string on the *full* endpoints and as an array of
// asset descriptors on the page/export endpoints, so the shape is intentionally loose.
export interface TildaPageFull extends TildaPage {
  html?: string;
  css?: string | unknown[];
  js?: string | unknown[];
  img?: Array<{ from: string; to: string }>;
}
