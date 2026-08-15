# Sanjeevani Application Architecture

## Product Boundary

Sanjeevani is a **pre-disclosure research triage system**. It accepts a researcher’s paper or research work, records the relevant disclosure context, extracts research entities for review, retrieves evidence, and produces a source-backed action report. It must never convert a collision state, a chemical similarity observation, or a deadline rule into a definitive legal, clinical, or manufacturing conclusion.

## Deployable Application Boundary

The managed application provides the production-ready user interface, authentication, private document storage, relational data model, role checks, evidence/report experiences, Patent Guidance, and assistant guardrails. The existing Python RAG and chemistry repositories are preserved as **future intelligence-service boundaries** rather than being embedded as unverified in-process logic.

| Boundary | Responsibility | First release behavior |
|---|---|---|
| Workspace application | Identity, uploads, analysis state, extraction review, evidence, reporting, guidance, audit events | Implemented in the application server and database |
| RAG adapter | Page-aware chunks, embedding version metadata, authorized hybrid retrieval, collision-state records | Contract and evidence experience implemented; external vector/index worker remains replaceable |
| Chemistry adapter | Structure/entity records, identity/similarity/route findings, source provenance | Contract and review experience implemented; RDKit service remains replaceable |
| Urgency adapter | Date provenance, jurisdiction/rule metadata, alert state, human escalation | Implemented as configurable screening logic with no universal grace-period rule |
| Assistant adapter | Permission-scoped explanations and workflow guidance using exact typed tools | Implemented with guarded server-side tool responses and no mutating actions |

## Required State Vocabulary

Analysis runs use `uploaded`, `extracting`, `needs_review`, `retrieving`, `analyzing`, `report_ready`, `failed`, and `deleted`. RAG collision outputs use `no_match_found`, `possible_overlap`, `strong_collision`, and `insufficient_evidence`. Urgency alerts use `30-day`, `7-day`, `critical`, and `expired`.

## Privacy Rules

Research files are private objects referenced by storage key, not stored in database columns. Each query must scope access through the authenticated owner or authorized organization membership. The initial Institutional Network returns only controlled match states and never exposes a partner institution’s documents, chunks, vectors, report content, or research details.

## Assistant Rules

The assistant may call only `get_analysis_status`, `get_missing_items`, `get_evidence`, `get_deadline_state`, and `get_next_actions`. It runs in Explain or Guide mode, cites workspace evidence where available, and refuses to produce legal or clinical conclusions. No state-changing tool is available in the first release.
