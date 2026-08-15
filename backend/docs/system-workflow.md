# Sanjeevani System Workflow

## 1. End-to-end researcher flow

```mermaid
flowchart TD
  A[Researcher signs in] --> B[Create private assessment]
  B --> C[Direct private-object upload with progress]
  C --> D[Server creates submission, file metadata, audit record, and uploaded analysis run]
  D --> E[Controlled run transition: extracting]
  E --> F[Researcher reviews and corrects extracted entities with page/section provenance]
  F --> G[Controlled run transition: retrieving]
  G --> H[External RAG service when approved and connected]
  H --> I[Source-cited collision evidence]
  G --> J[Controlled run transition: analyzing]
  J --> K[External chemistry/RDKit service when approved and connected]
  K --> L[Identity, similarity, route, provenance, and feasibility findings]
  I --> M[Urgency context and action report]
  L --> M
  M --> N[Researcher reviews report]
  N --> O[Patent Guidance and optional human-review handoff preparation]
```

## 2. Analysis state machine

```mermaid
stateDiagram-v2
  [*] --> uploaded
  uploaded --> extracting
  extracting --> needs_review
  needs_review --> retrieving
  retrieving --> analyzing
  analyzing --> report_ready
  uploaded --> failed
  extracting --> failed
  needs_review --> failed
  retrieving --> failed
  analyzing --> failed
  failed --> uploaded
  uploaded --> deleted
  extracting --> deleted
  needs_review --> deleted
  retrieving --> deleted
  analyzing --> deleted
  report_ready --> deleted
```

The web app owns state transitions and presentation. An intelligence worker may supply evidence and chemistry results, but it cannot bypass the research owner’s review and confirmation workflow.

## 3. RAG and chemistry boundary

| Step | Web app responsibility | External intelligence-service responsibility |
|---|---|---|
| Chunk preparation | Store page-aware records, owner ID, scope, and embedding version | Embed and index chunks in an isolated tenant namespace |
| Retrieval | Issue a server-side request with reviewed source IDs and filters | Run hybrid metadata/vector retrieval and return cited collision evidence |
| Chemistry | Supply confirmed chemistry/route entities only | Normalize inputs, run approved molecular/route tools, and return structured findings |
| Results | Persist versioned results and show disclaimers | Never infer legal, clinical, safety, or manufacturing conclusions |

## 4. Privacy and institutional workflow

```mermaid
flowchart LR
  R[Researcher-owned private record] --> P{Institutional opt-in and approved scope?}
  P -- No --> S[Researcher-only retrieval namespace]
  P -- Yes --> T[Privacy-preserving comparison service]
  T --> U[Controlled match state only]
  U --> V[Authorized reviewer notification]
  V --> W[No partner paper, chunk, vector, or report exposure]
```

Exact matching and similarity/substructure matching have different technical and privacy properties. The product must not call either zero-knowledge unless a reviewed implementation actually supports that claim.

## 5. Guidance assistant workflow

The assistant receives permission-scoped workspace metadata and may invoke only its read-only tools. It responds in **Explain** or **Guide** mode and returns citations when evidence is available. It never has a create, update, delete, share, or filing tool. Any user action that could change data, share a dossier, contact an expert, or initiate a filing remains a separate UI action with an explicit confirmation gate.
