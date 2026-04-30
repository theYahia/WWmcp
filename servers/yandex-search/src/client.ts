const BASE_URL = "https://searchapi.api.cloud.yandex.net";
const TIMEOUT = 20_000;
const MAX_RETRIES = 3;

function getCredentials(): { apiKey: string; folderId: string } {
  const apiKey = process.env.YANDEX_SEARCH_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;
  if (!apiKey) throw new Error("YANDEX_SEARCH_API_KEY is required. Get it in Yandex Cloud console → Service accounts → API keys.");
  if (!folderId) throw new Error("YANDEX_FOLDER_ID is required. Find it in Yandex Cloud console → Cloud → Folder ID.");
  return { apiKey, folderId };
}

/** POST JSON to Yandex Cloud Search API with Api-Key auth + folder header */
export async function cloudPost<T>(path: string, body: unknown): Promise<T> {
  const { apiKey, folderId } = getCredentials();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Api-Key ${apiKey}`,
          "Content-Type": "application/json; charset=utf-8",
          "x-folder-id": folderId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return (await response.json()) as T;

      const errBody = await response.text().catch(() => "");

      if (response.status >= 500 && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[yandex-search-mcp] HTTP ${response.status} from ${path}, retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${errBody}`);
    } catch (err) {
      clearTimeout(timer);
      if (attempt === MAX_RETRIES) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        console.error(`[yandex-search-mcp] Timeout ${path}, retry ${attempt}/${MAX_RETRIES}`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("All retries exhausted");
}
