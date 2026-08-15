export const ANALYSIS_STATUSES = [
  "uploaded",
  "extracting",
  "needs_review",
  "retrieving",
  "analyzing",
  "report_ready",
  "failed",
  "deleted",
] as const;

export const COLLISION_STATES = [
  "no_match_found",
  "possible_overlap",
  "strong_collision",
  "insufficient_evidence",
] as const;

export const DEADLINE_ALERT_STATES = ["30-day", "7-day", "critical", "expired"] as const;

export const ASSISTANT_MODES = ["explain", "guide"] as const;

export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];
export type CollisionState = (typeof COLLISION_STATES)[number];
export type DeadlineAlertState = (typeof DEADLINE_ALERT_STATES)[number];
export type AssistantMode = (typeof ASSISTANT_MODES)[number];

export type Provenance = {
  pageNumber?: number;
  section?: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

export type AssistantToolName =
  | "get_analysis_status"
  | "get_missing_items"
  | "get_evidence"
  | "get_deadline_state"
  | "get_next_actions";
