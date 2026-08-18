import { describe, it, expect } from "vitest";
import { MY_TASKS_TODAY, CREATE_DEAL_WIZARD } from "../src/prompts.js";

describe("my-tasks-today prompt", () => {
  it("scopes to the current user instead of listing everyone's tasks", () => {
    expect(MY_TASKS_TODAY.name).toBe("my-tasks-today");
    expect(MY_TASKS_TODAY.text).toContain("get_current_user");
    expect(MY_TASKS_TODAY.text).toContain("filter_responsible_id");
  });
});

describe("create-deal-wizard prompt", () => {
  it("lists pipelines via get_deal_programs and ends in create_deal", () => {
    expect(CREATE_DEAL_WIZARD.name).toBe("create-deal-wizard");
    expect(CREATE_DEAL_WIZARD.text).toContain("get_deal_programs");
    expect(CREATE_DEAL_WIZARD.text).toContain("create_deal");
  });
});
