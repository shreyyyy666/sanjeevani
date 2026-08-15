import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analysisRuns,
  assistantConversations,
  assistantMessages,
  auditEvents,
  chemistryFindings,
  documentChunks,
  evidenceItems,
  extractedEntities,
  institutionalConsents,
  organizationMemberships,
  reports,
  researchFiles,
  researchSubmissions,
  retrievalBatches,
  reviewHandoffs,
  urgencyEvents,
  users,
  workspaces,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export async function ensureWorkspace(ownerId: number, name = "Research workspace", institution?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId)).orderBy(desc(workspaces.updatedAt)).limit(1);
  if (existing[0]) return existing[0];
  const insert = await db.insert(workspaces).values({ ownerId, name, institution: institution ?? null });
  const rows = await db.select().from(workspaces).where(eq(workspaces.id, Number(insert[0].insertId))).limit(1);
  return rows[0]!;
}

export async function getAccessProfile(userId: number, systemRole: "user" | "admin") {
  if (systemRole === "admin") return { level: "administrator" as const, organizationRole: "system_admin" as const };
  const db = await getDb();
  if (!db) return { level: "researcher" as const, organizationRole: null };
  const membership = await db.select().from(organizationMemberships).where(eq(organizationMemberships.userId, userId)).limit(1);
  if (membership[0]?.role === "reviewer" || membership[0]?.role === "institution_admin") {
    return { level: "institutional_reviewer" as const, organizationRole: membership[0].role };
  }
  return { level: "researcher" as const, organizationRole: membership[0]?.role ?? null };
}

export async function createAssessment(input: {
  ownerId: number;
  title: string;
  institution?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  disclosureStatus: "private" | "internal_review" | "public_disclosure" | "published";
  conceptionDate?: Date | null;
  disclosureDate?: Date | null;
  publicationDate?: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const workspace = await ensureWorkspace(input.ownerId, "Research workspace", input.institution);
  const submissionInsert = await db.insert(researchSubmissions).values({
    workspaceId: workspace.id,
    ownerId: input.ownerId,
    title: input.title,
    institution: input.institution ?? null,
    fileKey: input.fileKey ?? null,
    fileName: input.fileName ?? null,
    mimeType: input.mimeType ?? null,
    fileSizeBytes: input.fileSizeBytes ?? null,
    disclosureStatus: input.disclosureStatus,
    conceptionDate: input.conceptionDate ?? null,
    disclosureDate: input.disclosureDate ?? null,
    publicationDate: input.publicationDate ?? null,
  });
  const submissionId = Number(submissionInsert[0].insertId);
  if (input.fileKey && input.fileName && input.mimeType && input.fileSizeBytes) {
    await db.insert(researchFiles).values({
      submissionId,
      ownerId: input.ownerId,
      fileKey: input.fileKey,
      originalFileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      privacyStatus: "private",
    });
  }
  const runInsert = await db.insert(analysisRuns).values({
    submissionId,
    ownerId: input.ownerId,
    status: "uploaded",
    progress: 8,
    currentStage: "Upload received · ready to begin extraction",
    startedAt: new Date(),
  });
  const analysisRunId = Number(runInsert[0].insertId);
  await db.insert(auditEvents).values({
    actorId: input.ownerId,
    workspaceId: workspace.id,
    action: "assessment.created",
    resourceType: "analysisRun",
    resourceId: String(analysisRunId),
    details: "Research submission stored as a private assessment.",
  });
  return { workspaceId: workspace.id, submissionId, analysisRunId };
}

export async function listAssessments(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      run: analysisRuns,
      submission: researchSubmissions,
      workspace: workspaces,
    })
    .from(analysisRuns)
    .innerJoin(researchSubmissions, eq(analysisRuns.submissionId, researchSubmissions.id))
    .innerJoin(workspaces, eq(researchSubmissions.workspaceId, workspaces.id))
    .where(eq(analysisRuns.ownerId, ownerId))
    .orderBy(desc(analysisRuns.createdAt));
}

export async function getAssessmentDetail(ownerId: number, analysisRunId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const runRows = await db
    .select({ run: analysisRuns, submission: researchSubmissions, workspace: workspaces })
    .from(analysisRuns)
    .innerJoin(researchSubmissions, eq(analysisRuns.submissionId, researchSubmissions.id))
    .innerJoin(workspaces, eq(researchSubmissions.workspaceId, workspaces.id))
    .where(and(eq(analysisRuns.id, analysisRunId), eq(analysisRuns.ownerId, ownerId)))
    .limit(1);
  if (!runRows[0]) return undefined;
  const [entities, evidence, chemistry, urgency, reportRows, chunks, retrieval] = await Promise.all([
    db.select().from(extractedEntities).where(eq(extractedEntities.analysisRunId, analysisRunId)),
    db.select().from(evidenceItems).where(eq(evidenceItems.analysisRunId, analysisRunId)),
    db.select().from(chemistryFindings).where(eq(chemistryFindings.analysisRunId, analysisRunId)),
    db.select().from(urgencyEvents).where(eq(urgencyEvents.analysisRunId, analysisRunId)),
    db.select().from(reports).where(eq(reports.analysisRunId, analysisRunId)).limit(1),
    db.select().from(documentChunks).where(eq(documentChunks.analysisRunId, analysisRunId)),
    db.select().from(retrievalBatches).where(eq(retrievalBatches.analysisRunId, analysisRunId)),
  ]);
  return { ...runRows[0], entities, evidence, chemistry, urgency, chunks, retrieval, report: reportRows[0] ?? null };
}

export async function addExtractionEntity(input: {
  ownerId: number;
  analysisRunId: number;
  kind: "compound" | "api" | "synthesis_step" | "therapeutic_context" | "date" | "citation";
  label: string;
  details?: string | null;
  pageNumber?: number | null;
  sectionLabel?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const allowed = await db
    .select({ analysisRunId: analysisRuns.id })
    .from(analysisRuns)
    .where(and(eq(analysisRuns.id, input.analysisRunId), eq(analysisRuns.ownerId, input.ownerId)))
    .limit(1);
  if (!allowed[0]) throw new Error("Analysis run not found");
  const { ownerId: _ownerId, ...entity } = input;
  await db.insert(extractedEntities).values({ ...entity, details: input.details ?? null, pageNumber: input.pageNumber ?? null, sectionLabel: input.sectionLabel ?? null });
}

export async function setExtractionEntityConfirmation(ownerId: number, entityId: number, confirmed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const allowed = await db
    .select({ entityId: extractedEntities.id })
    .from(extractedEntities)
    .innerJoin(analysisRuns, eq(extractedEntities.analysisRunId, analysisRuns.id))
    .where(and(eq(extractedEntities.id, entityId), eq(analysisRuns.ownerId, ownerId)))
    .limit(1);
  if (!allowed[0]) throw new Error("Entity not found");
  await db.update(extractedEntities).set({ confirmed, needsReview: !confirmed }).where(eq(extractedEntities.id, entityId));
}

export async function updateExtractionEntity(input: {
  ownerId: number;
  entityId: number;
  kind: "compound" | "api" | "synthesis_step" | "therapeutic_context" | "date" | "citation";
  label: string;
  details?: string | null;
  pageNumber?: number | null;
  sectionLabel?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const allowed = await db
    .select({ entityId: extractedEntities.id })
    .from(extractedEntities)
    .innerJoin(analysisRuns, eq(extractedEntities.analysisRunId, analysisRuns.id))
    .where(and(eq(extractedEntities.id, input.entityId), eq(analysisRuns.ownerId, input.ownerId)))
    .limit(1);
  if (!allowed[0]) throw new Error("Entity not found");
  await db.update(extractedEntities).set({
    kind: input.kind,
    label: input.label,
    details: input.details ?? null,
    pageNumber: input.pageNumber ?? null,
    sectionLabel: input.sectionLabel ?? null,
    needsReview: true,
    confirmed: false,
  }).where(eq(extractedEntities.id, input.entityId));
}

type AnalysisStatus = NonNullable<(typeof analysisRuns.$inferSelect)["status"]>;

export const allowedAnalysisTransitions: Record<AnalysisStatus, AnalysisStatus[]> = {
  uploaded: ["extracting", "failed", "deleted"],
  extracting: ["needs_review", "failed", "deleted"],
  needs_review: ["retrieving", "failed", "deleted"],
  retrieving: ["analyzing", "failed", "deleted"],
  analyzing: ["report_ready", "failed", "deleted"],
  report_ready: ["deleted"],
  failed: ["uploaded", "deleted"],
  deleted: [],
};

export async function transitionAnalysisRun(ownerId: number, analysisRunId: number, nextStatus: AnalysisStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(analysisRuns).where(and(eq(analysisRuns.id, analysisRunId), eq(analysisRuns.ownerId, ownerId))).limit(1);
  const current = rows[0];
  if (!current) throw new Error("Analysis run not found");
  if (!allowedAnalysisTransitions[current.status].includes(nextStatus)) throw new Error(`Invalid analysis transition from ${current.status} to ${nextStatus}`);
  const stageByStatus: Record<string, string> = {
    uploaded: "Upload received",
    extracting: "Extraction processing started",
    needs_review: "Extraction review required",
    retrieving: "Authorized evidence retrieval started",
    analyzing: "Chemistry and feasibility review started",
    report_ready: "Evidence report ready for human review",
    failed: "Processing stopped — review the error record",
    deleted: "Assessment deleted",
  };
  const progressByStatus: Record<string, number> = { uploaded: 8, extracting: 28, needs_review: 45, retrieving: 62, analyzing: 82, report_ready: 100, failed: 0, deleted: 0 };
  await db.update(analysisRuns).set({
    status: nextStatus,
    progress: progressByStatus[nextStatus],
    currentStage: stageByStatus[nextStatus],
    ...(nextStatus === "report_ready" ? { completedAt: new Date() } : {}),
  }).where(eq(analysisRuns.id, analysisRunId));
}

export async function addReviewEvidence(ownerId: number, analysisRunId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const run = await db.select().from(analysisRuns).where(and(eq(analysisRuns.id, analysisRunId), eq(analysisRuns.ownerId, ownerId))).limit(1);
  if (!run[0]) throw new Error("Analysis run not found");
  if (run[0].status !== "analyzing") throw new Error("A review report can be prepared only after the analysis stage.");
  const existing = await db.select().from(evidenceItems).where(eq(evidenceItems.analysisRunId, analysisRunId)).limit(1);
  if (!existing[0]) {
    const entities = await db.select().from(extractedEntities).where(eq(extractedEntities.analysisRunId, analysisRunId));
    const chunks = entities.map((entity) => ({
      analysisRunId,
      ownerId,
      chunkText: [entity.label, entity.details].filter(Boolean).join(" · "),
      pageNumber: entity.pageNumber,
      sectionLabel: entity.sectionLabel,
      embeddingVersion: "sanjeevani-metadata-v1",
      tenantScope: "researcher" as const,
      indexStatus: "pending" as const,
    })).filter((chunk) => chunk.chunkText.length > 0);
    if (chunks.length) await db.insert(documentChunks).values(chunks);
    await db.insert(retrievalBatches).values({
      analysisRunId,
      embeddingVersion: "sanjeevani-metadata-v1",
      indexNamespace: `researcher-${ownerId}`,
      filterSnapshot: JSON.stringify({ ownerId, tenantScope: "researcher", allowInstitutionalNetwork: false, publicSourcesOnly: true }),
      status: "pending",
    });
    await db.insert(evidenceItems).values([
      {
        analysisRunId,
        collisionState: "possible_overlap",
        sourceType: "scientific_literature",
        sourceTitle: "Authorized literature review queue",
        pageReference: "Pending source review",
        rationale: "A review record has been created. Connect the approved RAG service to replace this controlled placeholder with source-grounded retrieval evidence.",
      },
      {
        analysisRunId,
        collisionState: "insufficient_evidence",
        sourceType: "institutional_network",
        sourceTitle: "Institutional network boundary",
        pageReference: "Not connected",
        rationale: "No partner research is exposed. Institutional comparison remains unavailable until an approved organization and privacy-preserving matching service are connected.",
      },
    ]);
    await db.insert(chemistryFindings).values([
      { analysisRunId, category: "exact_identity", label: "Exact identity normalization pending", status: "needs_review", details: "An approved chemistry adapter must normalize chemical names or structures before identity matching can be evaluated.", sourceName: "Chemistry adapter" },
      { analysisRunId, category: "structure_similarity", label: "Structure similarity review pending", status: "insufficient_evidence", details: "No similarity conclusion is available until a source-backed RDKit-compatible comparison is returned.", sourceName: "Chemistry adapter" },
      { analysisRunId, category: "route_analysis", label: "Synthetic route review pending", status: "needs_review", details: "Route steps must be confirmed by the researcher and checked against the approved source set before review.", sourceName: "Chemistry adapter" },
      { analysisRunId, category: "source_provenance", label: "Chemical source provenance incomplete", status: "insufficient_evidence", details: "No public chemistry source has been connected to this assessment yet.", sourceName: "Source registry" },
      { analysisRunId, category: "feasibility", label: "Local feasibility signals require review", status: "needs_review", details: "Raw-material availability, hazards, process complexity, cost drivers, and healthcare relevance require qualified source-backed analysis.", sourceName: "Feasibility adapter" },
    ]);
    await db.insert(urgencyEvents).values({
      analysisRunId,
      alertState: "critical",
      ruleName: "Human review required before public disclosure",
      jurisdiction: "Configure jurisdiction with qualified review",
      explanation: "This is a screening action state, not a legal deadline. Add disclosure and filing context before relying on any date calculation.",
    });
    await db.insert(reports).values({
      analysisRunId,
      title: "Pre-disclosure action report",
      executiveSummary: "This assessment combines researcher-confirmed extraction context, pending RAG retrieval boundaries, chemistry review categories, urgency metadata, and feasibility questions. It requires qualified human review before publication, filing, clinical, or manufacturing decisions.",
      recommendedEscalation: "Technology-transfer office or qualified patent professional",
      disclaimer: "Results are screening and decision support only. They are not a legal patentability opinion, clinical conclusion, or manufacturing recommendation.",
      reportStatus: "ready",
    });
  }
}

export async function getAssistantHistory(ownerId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const workspace = await db.select().from(workspaces).where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, ownerId))).limit(1);
  if (!workspace[0]) return [];
  const conversation = await db.select().from(assistantConversations).where(and(eq(assistantConversations.workspaceId, workspaceId), eq(assistantConversations.userId, ownerId))).orderBy(desc(assistantConversations.updatedAt)).limit(1);
  if (!conversation[0]) return [];
  return db.select().from(assistantMessages).where(eq(assistantMessages.conversationId, conversation[0].id)).orderBy(assistantMessages.createdAt);
}

export async function saveAssistantMessage(input: { ownerId: number; workspaceId: number; role: "user" | "assistant"; content: string; citations?: string | null; mode?: "explain" | "guide" }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  let conversation = await db.select().from(assistantConversations).where(and(eq(assistantConversations.workspaceId, input.workspaceId), eq(assistantConversations.userId, input.ownerId))).orderBy(desc(assistantConversations.updatedAt)).limit(1);
  if (!conversation[0]) {
    const result = await db.insert(assistantConversations).values({ workspaceId: input.workspaceId, userId: input.ownerId, mode: input.mode ?? "guide" });
    conversation = await db.select().from(assistantConversations).where(eq(assistantConversations.id, Number(result[0].insertId))).limit(1);
  }
  await db.insert(assistantMessages).values({ conversationId: conversation[0]!.id, role: input.role, content: input.content, citations: input.citations ?? null });
  await db.update(assistantConversations).set({ mode: input.mode ?? conversation[0]!.mode }).where(eq(assistantConversations.id, conversation[0]!.id));
}

export async function prepareReviewHandoff(ownerId: number, workspaceId: number, checklist: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const workspace = await db.select().from(workspaces).where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, ownerId))).limit(1);
  if (!workspace[0]) throw new Error("Workspace access is restricted");
  const result = await db.insert(reviewHandoffs).values({ ownerId, workspaceId, checklistSnapshot: JSON.stringify(checklist), status: "prepared" });
  await db.insert(auditEvents).values({ actorId: ownerId, workspaceId, action: "handoff.prepared", resourceType: "reviewHandoff", resourceId: String(result[0].insertId), details: "Researcher prepared a review handoff; no record was shared externally." });
  return { id: Number(result[0].insertId), status: "prepared" as const };
}

export async function setInstitutionalConsent(ownerId: number, workspaceId: number, scope: "disabled" | "exact_match_only" | "approved_similarity") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const workspace = await db.select().from(workspaces).where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, ownerId))).limit(1);
  if (!workspace[0]) throw new Error("Workspace access is restricted");
  await db.insert(institutionalConsents).values({ ownerId, workspaceId, scope, status: scope === "disabled" ? "revoked" : "active" });
  await db.insert(auditEvents).values({ actorId: ownerId, workspaceId, action: "institutional_consent.updated", resourceType: "institutionalConsent", details: `Researcher set institutional comparison scope to ${scope}.` });
  return { scope, status: scope === "disabled" ? "revoked" as const : "active" as const };
}
