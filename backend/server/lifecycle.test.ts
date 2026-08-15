import { describe, expect, it } from "vitest";
import { allowedAnalysisTransitions } from "./db";

describe("Sanjeevani analysis lifecycle", () => {
  it("moves from private upload through review and report readiness in controlled order", () => {
    expect(allowedAnalysisTransitions.uploaded).toContain("extracting");
    expect(allowedAnalysisTransitions.extracting).toContain("needs_review");
    expect(allowedAnalysisTransitions.needs_review).toContain("retrieving");
    expect(allowedAnalysisTransitions.retrieving).toContain("analyzing");
    expect(allowedAnalysisTransitions.analyzing).toContain("report_ready");
  });

  it("keeps terminal and recovery behavior explicit", () => {
    expect(allowedAnalysisTransitions.report_ready).toEqual(["deleted"]);
    expect(allowedAnalysisTransitions.failed).toEqual(["uploaded", "deleted"]);
    expect(allowedAnalysisTransitions.deleted).toEqual([]);
  });
});
