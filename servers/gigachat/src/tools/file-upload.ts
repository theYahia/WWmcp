import { z } from "zod";
import { gigachatPostFormData } from "../client.js";

export const fileUploadSchema = z.object({
  file_content: z.string().describe("Base64-encoded содержимое файла"),
  file_name: z.string().describe("Имя файла с расширением"),
  purpose: z.string().default("general").describe("Назначение файла (general, assistants)"),
});

export async function handleFileUpload(params: z.infer<typeof fileUploadSchema>): Promise<string> {
  const buffer = Buffer.from(params.file_content, "base64");
  const blob = new Blob([buffer]);
  const formData = new FormData();
  formData.append("file", blob, params.file_name);
  formData.append("purpose", params.purpose);

  const result = await gigachatPostFormData("/files", formData);
  return JSON.stringify(result, null, 2);
}
