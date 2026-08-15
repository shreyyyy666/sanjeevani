import { describe, expect, it } from "vitest";
import { assistantToolNames, resolveAssistantTool } from "./assistant";

describe("Sanjeevani guidance assistant", () => {
  it("exposes only the approved read-only tools", () => {
    expect(assistantToolNames).toEqual([
      "get_analysis_status",
      "get_missing_items",
      "get_evidence",
      "get_deadline_state",
      "get_next_actions",
    ]);
  });

  it("uses bounded wording when no assessment is selected", () => {
    const response = resolveAssistantTool("get_deadline_state");
    expect(response.response).toContain("No urgency rule has been configured");
    expect(response.response).not.toMatch(/patentable|safe|clinical conclusion/i);
  });

  it("does not expose a mutation tool", () => {
    expect(assistantToolNames.some((name) => name.includes("create") || name.includes("update") || name.includes("delete"))).toBe(false);
  });
});
