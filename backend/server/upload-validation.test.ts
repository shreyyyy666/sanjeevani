import { describe, expect, it } from "vitest";
import { assertResearchFile } from "./routers";

describe("research upload validation", () => {
  it("accepts supported document types", () => {
    expect(() => assertResearchFile("paper.pdf", "application/pdf", 1024)).not.toThrow();
    expect(() => assertResearchFile("thesis.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024)).not.toThrow();
  });

  it("rejects executable or mismatched file types", () => {
    expect(() => assertResearchFile("payload.exe", "application/octet-stream", 1024)).toThrow("Only PDF");
    expect(() => assertResearchFile("paper.pdf", "text/plain", 1024)).toThrow("extension");
  });

  it("rejects files above the server limit", () => {
    expect(() => assertResearchFile("paper.pdf", "application/pdf", 10 * 1024 * 1024 + 1)).toThrow("10 MB");
  });
});
