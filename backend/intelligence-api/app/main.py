from enum import Enum
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field


class CollisionState(str, Enum):
    no_match_found = "no_match_found"
    possible_overlap = "possible_overlap"
    strong_collision = "strong_collision"
    insufficient_evidence = "insufficient_evidence"


class Chunk(BaseModel):
    text: str = Field(min_length=1)
    page_number: int | None = Field(default=None, ge=1)
    section_label: str | None = None


class IngestRequest(BaseModel):
    analysis_run_id: int
    owner_id: int
    tenant_scope: Literal["researcher", "approved_institution"]
    embedding_version: str
    chunks: list[Chunk]


class RetrieveRequest(BaseModel):
    analysis_run_id: int
    owner_id: int
    tenant_scope: Literal["researcher", "approved_institution"]
    embedding_version: str
    source_registry_ids: list[int] = []


class EvidenceRecord(BaseModel):
    collision_state: CollisionState
    source_title: str
    source_url: str | None = None
    page_reference: str | None = None
    rationale: str


app = FastAPI(title="Sanjeevani Intelligence API", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "sanjeevani-intelligence-api"}


@app.post("/v1/ingest")
async def ingest(request: IngestRequest) -> dict[str, object]:
    """Contract for a worker that stores page-aware chunks in a tenant-scoped vector index.

    Production implementation must verify the caller, isolate tenant namespaces, persist
    embedding version metadata, and never write raw partner content to another tenant.
    """
    return {"accepted": True, "analysis_run_id": request.analysis_run_id, "chunk_count": len(request.chunks), "embedding_version": request.embedding_version}


@app.post("/v1/retrieve", response_model=list[EvidenceRecord])
async def retrieve(request: RetrieveRequest) -> list[EvidenceRecord]:
    """Contract for hybrid metadata/vector retrieval against approved source registries.

    This starter returns an honest unavailable state. Replace it only with a source-cited
    retrieval implementation; never infer no_match_found because a service is disconnected.
    """
    return [EvidenceRecord(
        collision_state=CollisionState.insufficient_evidence,
        source_title="Intelligence service not connected",
        rationale="No live vector retrieval source was available for this request."
    )]
