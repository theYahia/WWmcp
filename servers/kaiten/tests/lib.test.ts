import { describe, it, expect } from "vitest";
import {
  buildQuery,
  formatList,
  json,
  projectBoard,
  projectCard,
  projectChecklist,
  projectColumn,
  projectComment,
  projectLane,
  projectSpace,
  projectTag,
  projectUser,
} from "../src/lib.js";

describe("buildQuery", () => {
  it("skips undefined/null/empty and prefixes with ?", () => {
    expect(buildQuery({ a: 1, b: undefined, c: null, d: "", e: "x" })).toBe("?a=1&e=x");
  });

  it("returns '' when nothing is set", () => {
    expect(buildQuery({ a: undefined })).toBe("");
  });

  it("serializes booleans and numbers", () => {
    expect(buildQuery({ archived: false, limit: 50 })).toBe("?archived=false&limit=50");
  });
});

describe("formatList", () => {
  it("projects array rows with total", () => {
    const out = JSON.parse(formatList([{ id: 1, title: "A", extra: "drop" }], "cards", projectCard));
    expect(out.total).toBe(1);
    expect(out.cards[0]).toMatchObject({ id: 1, title: "A" });
    expect(out.cards[0].extra).toBeUndefined();
  });

  it("passes through non-array payloads unchanged", () => {
    const out = JSON.parse(formatList({ error: "x" }, "cards", projectCard));
    expect(out).toEqual({ error: "x" });
  });
});

describe("projectCard", () => {
  it("keeps key fields and compacts owner", () => {
    const p = projectCard({
      id: 3,
      title: "T",
      board_id: 1,
      column_id: 2,
      owner: { id: 9, full_name: "Jane", email: "j@x.io" },
    }) as Record<string, unknown>;
    expect(p.id).toBe(3);
    expect(p.owner).toEqual({ id: 9, full_name: "Jane" });
  });
});

describe("json", () => {
  it("pretty-prints", () => {
    expect(json({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});

describe("projections", () => {
  it("projectBoard / projectSpace / projectColumn / projectLane", () => {
    expect(projectBoard({ id: 1, title: "B", space_id: 2 })).toMatchObject({ id: 1, title: "B", space_id: 2 });
    expect(projectSpace({ id: 1, title: "S", archived: false })).toMatchObject({ id: 1, title: "S" });
    expect(projectColumn({ id: 1, title: "C", board_id: 9 })).toMatchObject({ id: 1, board_id: 9 });
    expect(projectLane({ id: 1, title: "L", board_id: 9 })).toMatchObject({ id: 1, board_id: 9 });
  });

  it("projectUser / projectTag / projectComment", () => {
    expect(projectUser({ id: 1, full_name: "Jane" })).toMatchObject({ id: 1, full_name: "Jane" });
    expect(projectTag({ id: 1, name: "urgent", color: 3 })).toMatchObject({ id: 1, name: "urgent" });
    const c = projectComment({ id: 1, text: "hi", author: { id: 2, full_name: "A" } }) as Record<string, unknown>;
    expect(c.author).toEqual({ id: 2, full_name: "A" });
  });

  it("projectChecklist maps items", () => {
    const c = projectChecklist({
      id: 1,
      name: "todo",
      items: [{ id: 5, text: "x", checked: true }],
    }) as { items: unknown[] };
    expect(c.items).toEqual([{ id: 5, text: "x", checked: true }]);
  });
});
