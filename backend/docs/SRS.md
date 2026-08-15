# Software Requirements Specification: Sanjeevani

**Version:** 0.1.0  
**Status:** Implementation handoff  
**System:** Sanjeevani clinical research intelligence workspace

## 1. Purpose and scope

Sanjeevani is a researcher-facing web application for transforming a private paper, manuscript, thesis, or technical research record into a structured, review-ready assessment. The intended workflow is to preserve researcher control before public disclosure, organize molecular and synthesis-route information, present evidence and feasibility boundaries, make patent-preparation steps more legible, and route high-consequence decisions to qualified reviewers.

The application is **screening and decision support only**. It must not present a patentability percentage, legal opinion, filing deadline, clinical conclusion, safety conclusion, or manufacturing recommendation. Patent information can help researchers understand technical fields, but product and process protection are jurisdiction-dependent and require appropriate filing and expert review.[1]

## 2. Stakeholders and roles

| Role | Primary capability | Access boundary |
|---|---|---|
| Researcher | Creates and reviews private assessments | Can access only owned workspace records |
| Institutional reviewer | Uses an explicitly configured institutional review role | Must never see another researcher’s documents or vectors by default |
| Administrator | Maintains system-level controls and approved source policies | Cannot bypass research privacy without an auditable, authorized flow |
| Patent or technology-transfer professional | Receives a researcher-approved review package | Does not receive any dossier automatically |
| Intelligence service | Processes authorized chunks and confirmed molecular/route records | Operates server-to-server, scoped by tenant and approved source policy |

## 3. Functional requirements

| ID | Requirement | Implemented web behavior |
|---|---|---|
| FR-01 | Public product experience | A no-logo dark editorial landing page explains the pre-disclosure workflow, uses layered scroll motion, and routes to the workspace. |
| FR-02 | Authentication and workspace | Authenticated users receive a sidebar workspace with New Assessment, My Research, Analysis Runs, Evidence and Reports, Patent Guidance, and Institutional Network. |
| FR-03 | Private document upload | The browser uploads approved document types directly to private object storage using a server-generated key; the form displays real upload progress. |
| FR-04 | Research metadata | Every assessment records a title, institution, disclosure status, and optional conception, disclosure, and publication dates. |
| FR-05 | Analysis lifecycle | Runs begin at `uploaded` and move through `extracting`, `needs_review`, `retrieving`, `analyzing`, `report_ready`, `failed`, or `deleted` under server-controlled transition rules. |
| FR-06 | Extraction review | Users can create, edit, flag, and confirm compounds, APIs, synthesis steps, therapeutic context, dates, and citations with page and section provenance. |
| FR-07 | Collision evidence model | The data contract uses only `no_match_found`, `possible_overlap`, `strong_collision`, and `insufficient_evidence`. A disconnected intelligence source must yield `insufficient_evidence`, not a novelty conclusion. |
| FR-08 | Chemistry model | Exact identity, structure similarity, route analysis, source provenance, and feasibility are separate findings. Live scientific conclusions require a validated chemistry service. |
| FR-09 | Urgency model | Alert states are `30-day`, `7-day`, `critical`, and `expired`. The product stores jurisdiction and source metadata but never assumes a universal grace period. |
| FR-10 | Action report | The report combines stored evidence, chemistry, urgency, feasibility, escalation, and a mandatory screening-only disclaimer. |
| FR-11 | Patent Guidance | Researchers receive sourced educational content, a readiness checklist, and an explicit confirmation step before a review-handoff preparation is recorded. |
| FR-12 | Institutional Network | The UI states the opt-in and least-disclosure model; no partner research content is exposed by the website. |
| FR-13 | Guidance assistant | Explain and Guide modes use the exact read-only tools `get_analysis_status`, `get_missing_items`, `get_evidence`, `get_deadline_state`, and `get_next_actions`. |
| FR-14 | External intelligence boundary | A separate Python service contract supports tenant-scoped ingestion, hybrid retrieval, and structured chemistry outputs without running RDKit or a vector database inside the web deployment. |

## 4. Non-functional requirements

The web app must use secure server-side procedures for data access, private object storage for document bytes, and role/owner checks on workspace records. It must preserve visible focus states, responsive layouts, reduced-motion behavior, and readable contrast across desktop and mobile. Any future source ingestion must be restricted to reviewed registry records and must provide source provenance.

The deployed Node application must remain functional when the optional Python/vector worker is unavailable. In that state, it must communicate the limitation rather than generate unsupported retrieval or chemistry claims.

## 5. Architecture requirements

The application has three boundaries. The **client** is a React workspace and never calls private storage, vector databases, source registries, or chemistry services directly. The **application server** is responsible for auth, typed procedures, private-file metadata, lifecycle state, audit records, reports, and assistant policy. The separate **intelligence service** performs page-aware chunk processing, embedding/retrieval, and RDKit-compatible chemistry operations once deployed and approved.

WIPO describes patents as rights granted for inventions and notes that the relevant invention can be a product or a process, which is why Sanjeevani models molecules and routes separately.[1] The PCT system is an international pathway that still requires users to understand the applicable downstream processes; Sanjeevani therefore provides educational navigation rather than filing automation.[2]

## 6. External-service acceptance requirements

Before live RAG/RDKit output is enabled, the service must have an authenticated health endpoint; tenant-scoped `ingest`, `retrieve`, and `chemistry/screen` endpoints; approved source-registry enforcement; record/page citations; embedding/result version metadata; and an independent validation plan. The detailed activation checklist is in `docs/intelligence-service-activation.md`.

## 7. References

[1] [WIPO, “Patents”](https://www.wipo.int/en/web/patents)  
[2] [WIPO, “PCT – The International Patent System”](https://www.wipo.int/en/web/pct-system)  
[3] [WIPO Lex, “Manual of Patent Office Practice and Procedure, 2010, India”](https://www.wipo.int/wipolex/en/legislation/details/7648)
