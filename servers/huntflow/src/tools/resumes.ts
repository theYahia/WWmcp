import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFResume } from "../types.js";

// Список резюме кандидата приходит в поле `external` объекта кандидата
// (отдельного GET /externals в API v2 нет — только GET /externals/{id}).
export const getApplicantResumesSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  applicant_id: z.coerce.number().describe("ID кандидата"),
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const getApplicantResumesOutput = listOutputSchema(HFResume);

export async function handleGetApplicantResumes(
  params: z.infer<typeof getApplicantResumesSchema>,
): Promise<Record<string, unknown>> {
  const applicant = (await hfGet(
    `/accounts/${params.account_id}/applicants/${params.applicant_id}`,
  )) as { external?: unknown[] };
  const items = Array.isArray(applicant?.external) ? applicant.external : [];
  return curateList({ items }, KEYS.resume, params.raw);
}

// Полное тело конкретного резюме (external).
export const getResumeSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта"),
  applicant_id: z.coerce.number().describe("ID кандидата"),
  external_id: z.coerce.number().describe("ID резюме (external) из get_applicant_resumes"),
});

export async function handleGetResume(params: z.infer<typeof getResumeSchema>): Promise<unknown> {
  return hfGet(
    `/accounts/${params.account_id}/applicants/${params.applicant_id}/externals/${params.external_id}`,
  );
}
