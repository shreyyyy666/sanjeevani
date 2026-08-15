# Sanjeevani Intelligence Services

The web application in `client/` and `server/` is the deployable researcher workspace. This `backend/` directory holds service contracts for workloads that require Python tooling, vector infrastructure, or RDKit. Those workloads must run as an approved external service because the managed web runtime is Node-only and cannot safely host a persistent Python/RDKit/vector stack.

| Service | Responsibility | Required boundary |
|---|---|---|
| `intelligence-api` | Page-aware chunk ingestion, embedding requests, hybrid retrieval, and collision evidence | Every request must include owner/tenant scope and an approved source registry ID |
| Chemistry adapter | OPSIN/RDKit normalization, identity/similarity assessment, and route/feasibility record preparation | It returns source-backed screening findings, not patentability, safety, or clinical conclusions |
| Source ingestion worker | Public-source retrieval through approved API or Hermes-compatible transport | It may only process source-registry records with `enabled=true` and `reviewStatus=approved` |

The workspace intentionally accepts `insufficient_evidence` when a live intelligence service is not connected. It must never convert an unavailable service into a false negative or a novelty claim.
