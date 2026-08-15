import { describe, expect, it } from "vitest";
import { ANALYSIS_STATUSES, ASSISTANT_MODES, COLLISION_STATES, DEADLINE_ALERT_STATES } from "../shared/sanjeevani";

describe("Sanjeevani domain guardrails", () => {
  it("keeps the required collision states verbatim", () => {
    expect(COLLISION_STATES).toEqual(["no_match_found", "possible_overlap", "strong_collision", "insufficient_evidence"]);
  });

  it("keeps the required deadline alert states verbatim", () => {
    expect(DEADLINE_ALERT_STATES).toEqual(["30-day", "7-day", "critical", "expired"]);
  });

  it("restricts assistant modes to explain and guide", () => {
    expect(ASSISTANT_MODES).toEqual(["explain", "guide"]);
    expect(ANALYSIS_STATUSES).toContain("needs_review");
    expect(ANALYSIS_STATUSES).toContain("report_ready");
  });
});
