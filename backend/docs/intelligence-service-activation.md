# Activating Live Intelligence Services

Sanjeevani’s web application is deployable without an intelligence worker. Until a reviewed service is connected, it deliberately displays bounded workflow guidance and `insufficient_evidence` rather than inventing collision, chemistry, legal, clinical, or manufacturing conclusions.

## Required external interface

| Endpoint | Required input boundary | Required response boundary |
|---|---|---|
| `GET /health` | Service authentication only | Service version and health state; never research content |
| `POST /v1/ingest` | Researcher/tenant ID, page-aware chunks, embedding version, scope | Accepted chunk count and index status |
| `POST /v1/retrieve` | Tenant scope, source-registry IDs, filter snapshot, embedding version | Source-cited evidence with only `no_match_found`, `possible_overlap`, `strong_collision`, or `insufficient_evidence` |
| `POST /v1/chemistry/screen` | Confirmed chemical/route records and approved sources | Separate exact-identity, structure-similarity, route-analysis, source-provenance, and feasibility findings |

## Security conditions before enabling

1. The service must require a server-to-server authentication mechanism. Store the credential only as a server-side project secret; never expose it in the browser.
2. The service must isolate every vector namespace, document collection, and audit event by researcher or explicitly approved institutional scope.
3. A source registry record must be reviewed and enabled before the worker retrieves from that source. Public sources and institution-approved sources need separate policies.
4. Exact fingerprint matching and similarity/substructure matching have different privacy properties. Do not describe either as zero-knowledge unless the actual protocol has been independently reviewed.
5. The worker must return source metadata, page or record references where available, and an evidence version. An unavailable source must yield `insufficient_evidence`, not a negative or novelty conclusion.
6. Legal deadlines, patentability opinions, clinical conclusions, safety decisions, and manufacturing recommendations remain outside the worker’s authority. Sanjeevani’s UI must preserve its screening-only disclaimers.

## Future connection sequence

After the external service exists, add its base URL and server-side authentication secret, implement a server-only adapter in `server/`, run an authenticated health check, and test one non-sensitive synthetic request in a non-production tenant. Only then may an administrator enable a reviewed source registry and permit live retrieval for an opted-in assessment.
