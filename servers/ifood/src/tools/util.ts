import { getClient } from "../client.js";

export { getClient };

/** Format a tool result. iFood write endpoints often return 202/204 with no body
 *  (the client returns `null`); surface a friendly message instead of `null`. */
export function formatResult(
  result: unknown,
  acceptedMessage = "Accepted — no content returned. For order actions the result arrives as an event in the next poll.",
): string {
  return result === null ? acceptedMessage : JSON.stringify(result, null, 2);
}
