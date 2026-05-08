from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from models.embedding import EmbeddingJob
from models.link import Link
from models.note import Note
from models.pdf import PDF
from models.user import User
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/embeddings", tags=["embeddings"])


class EmbedRequest(BaseModel):
    resource_type: str  # "note" | "pdf" | "link"
    resource_id: int


class EmbedResponse(BaseModel):
    job_id: int
    status: str


class EmbedStatusResponse(BaseModel):
    status: str
    error_message: str | None = None


@router.post("", response_model=EmbedResponse)
async def create_embedding(
    workspace_id: int,
    body: EmbedRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    resource = await _get_resource(workspace_id, body.resource_type, body.resource_id, db)

    if resource.is_indexed:
        raise HTTPException(status_code=409, detail="Resource is already indexed")

    existing_job = await _get_active_job(
        workspace_id,
        body.resource_type,
        body.resource_id,
        db,
    )
    if existing_job:
        return EmbedResponse(job_id=existing_job.id, status=existing_job.status)

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
    result = await db.exec(select(EmbeddingJob).where(EmbeddingJob.id == job_id))
    job = result.first()
    if not job:
        raise HTTPException(status_code=404, detail="job not found")

    return EmbedStatusResponse(status=job.status, error_message=job.error_message)


async def _get_active_job(
    workspace_id: int,
    resource_type: str,
    resource_id: int,
    db: AsyncSession,
) -> EmbeddingJob | None:
    result = await db.exec(
        select(EmbeddingJob).where(
            EmbeddingJob.workspace_id == workspace_id,
            EmbeddingJob.resource_type == resource_type,
            EmbeddingJob.resource_id == resource_id,
            EmbeddingJob.status.in_(("pending", "processing")),
        )
    )
    return result.first()


async def _get_resource(
    workspace_id: int,
    resource_type: str,
    resource_id: int,
    db: AsyncSession,
) -> Note | PDF | Link:
    model_map = {
        "note": Note,
        "pdf": PDF,
        "link": Link,
    }
    model = model_map.get(resource_type)
    if model is None:
        raise HTTPException(status_code=400, detail="Unsupported resource type")

    result = await db.exec(
        select(model).where(model.id == resource_id, model.workspace_id == workspace_id)
    )
    resource = result.first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource
