import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  participationStatus: mysqlEnum("participationStatus", ["invited", "active", "paused"]).default("invited").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizationMemberships = mysqlTable("organizationMemberships", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["researcher", "reviewer", "institution_admin"]).default("researcher").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: int("organizationId").references(() => organizations.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const researchSubmissions = mysqlTable("researchSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  institution: varchar("institution", { length: 255 }),
  fileKey: varchar("fileKey", { length: 512 }),
  fileName: varchar("fileName", { length: 512 }),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSizeBytes: int("fileSizeBytes"),
  disclosureStatus: mysqlEnum("disclosureStatus", ["private", "internal_review", "public_disclosure", "published"]).default("private").notNull(),
  conceptionDate: timestamp("conceptionDate"),
  disclosureDate: timestamp("disclosureDate"),
  publicationDate: timestamp("publicationDate"),
  storageStatus: mysqlEnum("storageStatus", ["private", "deleted"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const researchFiles = mysqlTable("researchFiles", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => researchSubmissions.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSizeBytes: int("fileSizeBytes").notNull(),
  privacyStatus: mysqlEnum("privacyStatus", ["private", "deleted"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const sourceRegistries = mysqlTable("sourceRegistries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  transport: mysqlEnum("transport", ["api", "hermes_agent", "manual_review"]).notNull(),
  baseUrl: varchar("baseUrl", { length: 1024 }),
  policy: mysqlEnum("policy", ["public_only", "approved_partner_only"]).default("public_only").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["draft", "approved", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analysisRuns = mysqlTable("analysisRuns", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => researchSubmissions.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["uploaded", "extracting", "needs_review", "retrieving", "analyzing", "report_ready", "failed", "deleted"]).default("uploaded").notNull(),
  progress: int("progress").default(0).notNull(),
  currentStage: varchar("currentStage", { length: 128 }).default("Upload received").notNull(),
  errorMessage: text("errorMessage"),
  embeddingModel: varchar("embeddingModel", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
});

export const documentChunks = mysqlTable("documentChunks", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  chunkText: text("chunkText").notNull(),
  pageNumber: int("pageNumber"),
  sectionLabel: varchar("sectionLabel", { length: 255 }),
  embeddingVersion: varchar("embeddingVersion", { length: 128 }).notNull(),
  tenantScope: mysqlEnum("tenantScope", ["researcher", "approved_institution"]).default("researcher").notNull(),
  indexStatus: mysqlEnum("indexStatus", ["pending", "indexed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const retrievalBatches = mysqlTable("retrievalBatches", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  embeddingVersion: varchar("embeddingVersion", { length: 128 }).notNull(),
  indexNamespace: varchar("indexNamespace", { length: 255 }).notNull(),
  filterSnapshot: text("filterSnapshot").notNull(),
  status: mysqlEnum("status", ["pending", "ready", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const extractedEntities = mysqlTable("extractedEntities", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  kind: mysqlEnum("kind", ["compound", "api", "synthesis_step", "therapeutic_context", "date", "citation"]).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  details: text("details"),
  pageNumber: int("pageNumber"),
  sectionLabel: varchar("sectionLabel", { length: 255 }),
  confirmed: boolean("confirmed").default(false).notNull(),
  needsReview: boolean("needsReview").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const evidenceItems = mysqlTable("evidenceItems", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  collisionState: mysqlEnum("collisionState", ["no_match_found", "possible_overlap", "strong_collision", "insufficient_evidence"]).notNull(),
  sourceType: mysqlEnum("sourceType", ["public_record", "scientific_literature", "patent_record", "institutional_network"]).notNull(),
  sourceTitle: varchar("sourceTitle", { length: 500 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1024 }),
  sourceDate: timestamp("sourceDate"),
  pageReference: varchar("pageReference", { length: 128 }),
  rationale: text("rationale").notNull(),
  provenanceVersion: varchar("provenanceVersion", { length: 128 }).default("v1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chemistryFindings = mysqlTable("chemistryFindings", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  category: mysqlEnum("category", ["exact_identity", "structure_similarity", "route_analysis", "source_provenance", "feasibility"]).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["confirmed", "needs_review", "insufficient_evidence"]).default("needs_review").notNull(),
  details: text("details").notNull(),
  sourceName: varchar("sourceName", { length: 255 }),
  sourceUrl: varchar("sourceUrl", { length: 1024 }),
  pageNumber: int("pageNumber"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const urgencyEvents = mysqlTable("urgencyEvents", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  alertState: mysqlEnum("alertState", ["30-day", "7-day", "critical", "expired"]).notNull(),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 128 }).notNull(),
  ruleSourceUrl: varchar("ruleSourceUrl", { length: 1024 }),
  dueDate: timestamp("dueDate"),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  analysisRunId: int("analysisRunId").notNull().unique().references(() => analysisRuns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  executiveSummary: text("executiveSummary").notNull(),
  recommendedEscalation: varchar("recommendedEscalation", { length: 255 }).notNull(),
  disclaimer: text("disclaimer").notNull(),
  reportStatus: mysqlEnum("reportStatus", ["draft", "ready", "shared"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reviewHandoffs = mysqlTable("reviewHandoffs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  checklistSnapshot: text("checklistSnapshot").notNull(),
  status: mysqlEnum("status", ["prepared", "released", "revoked"]).default("prepared").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const institutionalConsents = mysqlTable("institutionalConsents", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: int("organizationId").references(() => organizations.id, { onDelete: "set null" }),
  scope: mysqlEnum("scope", ["disabled", "exact_match_only", "approved_similarity"]).default("disabled").notNull(),
  status: mysqlEnum("status", ["draft", "active", "revoked"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assistantConversations = mysqlTable("assistantConversations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  mode: mysqlEnum("mode", ["explain", "guide"]).default("guide").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assistantMessages = mysqlTable("assistantMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => assistantConversations.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  citations: text("citations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: int("workspaceId").references(() => workspaces.id, { onDelete: "set null" }),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 128 }).notNull(),
  resourceId: varchar("resourceId", { length: 128 }),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
