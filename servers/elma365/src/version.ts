import { createRequire } from "node:module";

// Единый источник версии — package.json. Резолвится одинаково в dev (src/) и build (dist/):
// оба лежат на один уровень ниже корня репозитория.
const require = createRequire(import.meta.url);
export const VERSION: string = (require("../package.json") as { version: string }).version;
