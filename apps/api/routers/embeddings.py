import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sse_starlette.sse import EventSourceResponse

from core.database import get_db
from core.dependencies import get_current_user
from models.embedding import EmbeddingJob
from models.user import User
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/embeddings", tags=["embeddings"])


class EmbedRequest(BaseModel):
    resource_type: str  # "note" | "pdf" | "link"
    resource_id: int


class EmbedResponse(BaseModel):
    job_id: int
    status: str


@router.post("", response_model=EmbedResponse)
async def create_embedding(
    workspace_id: int,
    body: EmbedRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)

    job = EmbeddingJob(
        resource_type=body.resource_type,
        resource_id=body.resource_id,
        workspace_id=workspace_id,
        status="pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    from workers.embedding_worker import run_embedding_job
    background_tasks.add_task(run_embedding_job, job.id)

    return EmbedResponse(job_id=job.id, status="pending")


@router.get("/status/{job_id}")
async def embedding_status_stream(
    workspace_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)

    async def event_generator():
        while True:
            result = await db.exec(
                select(EmbeddingJob).where(EmbeddingJob.id == job_id)
            )
            job = result.first()
            if not job:
                yield {"event": "error", "data": "job not found"}
                break

            yield {"event": "status", "data": job.status}

            if job.status in ("done", "error"):
                break

            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())
