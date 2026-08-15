import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePresignPut, storagePut } from "./storage";
import { assistantToolNames, createGuidanceResponse } from "./assistant";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addExtractionEntity,
  addReviewEvidence,
  createAssessment,
  ensureWorkspace,
  getAssessmentDetail,
  prepareReviewHandoff,
  getAssistantHistory,
  getAccessProfile,
  listAssessments,
  saveAssistantMessage,
  setExtractionEntityConfirmation,
  setInstitutionalConsent,
  transitionAnalysisRun,
  updateExtractionEntity,
} from "./db";

const disclosureStatus = z.enum(["private", "internal_review", "public_disclosure", "published"]);
const entityKind = z.enum(["compound", "api", "synthesis_step", "therapeutic_context", "date", "citation"]);
const assistantMode = z.enum(["explain", "guide"]);

function requireWorkspaceOwner(workspaceOwnerId: number, ownerId: number) {
  if (workspaceOwnerId !== ownerId) throw new TRPCError({ code: "FORBIDDEN", message: "Workspace access is restricted." });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  sanjeevani: router({
    access: protectedProcedure.query(({ ctx }) => getAccessProfile(ctx.user.id, ctx.user.role)),
    prepareReviewHandoff: protectedProcedure.input(z.object({ workspaceId: z.number().int().positive(), checklist: z.array(z.string().min(1)).min(1).max(20) })).mutation(({ ctx, input }) => prepareReviewHandoff(ctx.user.id, input.workspaceId, input.checklist)),
    setInstitutionalConsent: protectedProcedure.input(z.object({ workspaceId: z.number().int().positive(), scope: z.enum(["disabled", "exact_match_only", "approved_similarity"]) })).mutation(({ ctx, input }) => setInstitutionalConsent(ctx.user.id, input.workspaceId, input.scope)),
    overview: protectedProcedure.query(async ({ ctx }) => {
      const assessments = await listAssessments(ctx.user.id);
      const workspace = await ensureWorkspace(ctx.user.id);
      const access = await getAccessProfile(ctx.user.id, ctx.user.role);
      return { workspace, assessments, access };
    }),
    createAssessment: protectedProcedure
      .input(z.object({
        title: z.string().min(3).max(500),
        institution: z.string().max(255).optional(),
        disclosureStatus,
        conceptionDate: z.string().datetime().optional(),
        disclosureDate: z.string().datetime().optional(),
        publicationDate: z.string().datetime().optional(),
        fileName: z.string().max(512).optional(),
        mimeType: z.string().max(128).optional(),
        fileBase64: z.string().optional(),
        fileKey: z.string().max(512).optional(),
        fileSizeBytes: z.number().int().positive().max(10 * 1024 * 1024).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let fileKey: string | undefined = input.fileKey;
        let fileSizeBytes: number | undefined = input.fileSizeBytes;
        if (fileKey && !fileKey.startsWith(`research/${ctx.user.id}/`)) throw new TRPCError({ code: "FORBIDDEN", message: "The upload key is not scoped to your workspace." });
        if (input.fileBase64 && input.fileName && input.mimeType) {
          const base64 = input.fileBase64.includes(",") ? input.fileBase64.split(",").pop()! : input.fileBase64;
          const buffer = Buffer.from(base64, "base64");
          if (buffer.byteLength > 10 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Upload must be 10 MB or smaller." });
          const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
          const stored = await storagePut(`research/${ctx.user.id}/${Date.now()}-${safeName}`, buffer, input.mimeType);
          fileKey = stored.key;
          fileSizeBytes = buffer.byteLength;
        }
        return createAssessment({
          ownerId: ctx.user.id,
          title: input.title,
          institution: input.institution,
          disclosureStatus: input.disclosureStatus,
          conceptionDate: input.conceptionDate ? new Date(input.conceptionDate) : null,
          disclosureDate: input.disclosureDate ? new Date(input.disclosureDate) : null,
          publicationDate: input.publicationDate ? new Date(input.publicationDate) : null,
          fileKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSizeBytes,
        });
      }),
    prepareResearchUpload: protectedProcedure
      .input(z.object({ fileName: z.string().min(1).max(512), mimeType: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        return storagePresignPut(`research/${ctx.user.id}/${Date.now()}-${safeName}`);
      }),
    assessment: protectedProcedure.input(z.object({ analysisRunId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const detail = await getAssessmentDetail(ctx.user.id, input.analysisRunId);
      if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found." });
      requireWorkspaceOwner(detail.workspace.ownerId, ctx.user.id);
      return detail;
    }),
    addEntity: protectedProcedure
      .input(z.object({ analysisRunId: z.number().int().positive(), kind: entityKind, label: z.string().min(2).max(500), details: z.string().max(4000).optional(), pageNumber: z.number().int().positive().optional(), sectionLabel: z.string().max(255).optional() }))
      .mutation(async ({ ctx, input }) => {
        const detail = await getAssessmentDetail(ctx.user.id, input.analysisRunId);
        if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found." });
        await addExtractionEntity(input);
        return { success: true };
      }),
    confirmEntity: protectedProcedure
      .input(z.object({ entityId: z.number().int().positive(), confirmed: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await setExtractionEntityConfirmation(ctx.user.id, input.entityId, input.confirmed);
        return { success: true };
      }),
    updateEntity: protectedProcedure
      .input(z.object({ entityId: z.number().int().positive(), kind: entityKind, label: z.string().min(2).max(500), details: z.string().max(4000).optional(), pageNumber: z.number().int().positive().optional(), sectionLabel: z.string().max(255).optional() }))
      .mutation(async ({ ctx, input }) => {
        await updateExtractionEntity({ ownerId: ctx.user.id, ...input });
        return { success: true };
      }),
    transitionAnalysis: protectedProcedure
      .input(z.object({ analysisRunId: z.number().int().positive(), nextStatus: z.enum(["uploaded", "extracting", "needs_review", "retrieving", "analyzing", "report_ready", "failed", "deleted"]) }))
      .mutation(async ({ ctx, input }) => {
        await transitionAnalysisRun(ctx.user.id, input.analysisRunId, input.nextStatus);
        return { success: true };
      }),
    generateReviewReport: protectedProcedure
      .input(z.object({ analysisRunId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addReviewEvidence(ctx.user.id, input.analysisRunId);
        await transitionAnalysisRun(ctx.user.id, input.analysisRunId, "report_ready");
        return { success: true };
      }),
    assistant: router({
      history: protectedProcedure.input(z.object({ workspaceId: z.number().int().positive() })).query(({ ctx, input }) => getAssistantHistory(ctx.user.id, input.workspaceId)),
      ask: protectedProcedure
        .input(z.object({ workspaceId: z.number().int().positive(), analysisRunId: z.number().int().positive().optional(), mode: assistantMode, content: z.string().min(2).max(4000), tool: z.enum(assistantToolNames).optional() }))
        .mutation(async ({ ctx, input }) => {
          const detail = input.analysisRunId ? await getAssessmentDetail(ctx.user.id, input.analysisRunId) : undefined;
          if (detail) requireWorkspaceOwner(detail.workspace.ownerId, ctx.user.id);
          const guidance = await createGuidanceResponse({ content: input.content, mode: input.mode, detail, requestedTool: input.tool });
          await saveAssistantMessage({ ownerId: ctx.user.id, workspaceId: input.workspaceId, role: "user", content: input.content, mode: input.mode });
          await saveAssistantMessage({ ownerId: ctx.user.id, workspaceId: input.workspaceId, role: "assistant", content: guidance.response, citations: guidance.citations.length ? JSON.stringify(guidance.citations) : null, mode: input.mode });
          return { response: guidance.response, citations: guidance.citations, mutationRequiresConfirmation: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
