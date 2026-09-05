import { describe, it, expect } from "vitest";

// The module builds its auth strategy at import time, which throws without credentials.
process.env.MOYSKLAD_TOKEN ??= "test-token";
const { _moyskladErrorMessage } = await import("../src/client.js");

describe("moyskladErrorMessage", () => {
  it("flattens the MoySklad errors[] structure", () => {
    const body = JSON.stringify({
      errors: [
        {
          error: "Ошибка сохранения объекта",
          error_message: "Не указано обязательное поле",
          parameter: "organization",
          code: 3006,
        },
      ],
    });
    expect(_moyskladErrorMessage(body)).toBe(
      "[3006] Ошибка сохранения объекта — Не указано обязательное поле (параметр: organization)",
    );
  });

  it("joins several errors", () => {
    const body = JSON.stringify({ errors: [{ error: "первая" }, { error: "вторая" }] });
    expect(_moyskladErrorMessage(body)).toBe("первая; вторая");
  });

  it("returns undefined for a body that is not MoySklad JSON", () => {
    expect(_moyskladErrorMessage("<html>502 Bad Gateway</html>")).toBeUndefined();
    expect(_moyskladErrorMessage(JSON.stringify({ message: "nope" }))).toBeUndefined();
    expect(_moyskladErrorMessage(JSON.stringify({ errors: [] }))).toBeUndefined();
    expect(_moyskladErrorMessage(undefined)).toBeUndefined();
  });
});
