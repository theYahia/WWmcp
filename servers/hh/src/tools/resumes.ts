import { z } from "zod";
import { hhGet } from "../client.js";
import type { Resume, SearchResult } from "../types.js";
import { formatResumeSearch, formatResume } from "../format.js";

const rawFlag = z
  .boolean()
  .optional()
  .describe("Return the full raw hh.ru JSON instead of the compact summary.");

// Resume ids are alphanumeric hashes, not numeric.
const resumeId = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, "resume_id must be an hh.ru resume id");

const RESUME_ACCESS_NOTE =
  "Resume search requires an EMPLOYER OAuth token (HH_ACCESS_TOKEN) AND a paid hh.ru resume-database subscription. Applicant/anonymous tokens get 403. Set HH_ACCESS_TOKEN and use validate_token to confirm your token's role.";

function requireToken(): void {
  if (!process.env.HH_ACCESS_TOKEN) {
    throw new Error(`HH_ACCESS_TOKEN is not set. ${RESUME_ACCESS_NOTE}`);
  }
}

export const searchResumesSchema = z.object({
  text: z.string().optional().describe("Search keywords (skills, job title, etc.)"),
  area: z.number().optional().describe("Region code (1=Moscow, 2=Saint Petersburg)"),
  professional_role: z
    .number()
    .optional()
    .describe("Professional role ID. Use get_professional_roles to find IDs."),
  salary: z.number().optional().describe("Expected salary amount"),
  experience: z
    .enum(["noExperience", "between1And3", "between3And6", "moreThan6"])
    .optional()
    .describe("Experience level"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
  raw: rawFlag,
});

export async function handleSearchResumes(
  params: z.infer<typeof searchResumesSchema>,
): Promise<string> {
  requireToken();
  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area != null) query.set("area", String(params.area));
  if (params.professional_role != null)
    query.set("professional_role", String(params.professional_role));
  if (params.salary != null) query.set("salary", String(params.salary));
  if (params.experience) query.set("experience", params.experience);
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/resumes?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatResumeSearch(result as SearchResult<Resume>);
}

export const getResumeSchema = z.object({
  resume_id: resumeId.describe("Resume ID"),
  raw: rawFlag,
});

export async function handleGetResume(
  params: z.infer<typeof getResumeSchema>,
): Promise<string> {
  requireToken();
  const result = await hhGet(`/resumes/${encodeURIComponent(params.resume_id)}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatResume(result as Resume);
}
