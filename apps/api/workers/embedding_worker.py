import asyncio
import logging
from datetime import datetime

from sqlmodel import select

from core.database import AsyncSessionLocal
from models.embedding import EmbeddingJob
from models.link import Link
from models.note import Note
from models.pdf import PDF

logger = logging.getLogger(__name__)


async def run_embedding_job(job_id: int) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.exec(select(EmbeddingJob).where(EmbeddingJob.id == job_id))
        job = result.first()
        if not job:
            return

        job.status = "processing"
        job.error_message = None
        job.updated_at = datetime.utcnow()
        db.add(job)
        await db.commit()

        try:
            title, text = await _get_resource_text(job, db)
            from services.embedding_service import embed_and_store
            await embed_and_store(
                job.workspace_id,
                job.resource_type,
                job.resource_id,
                text,
                title,
                db,
            )

            job.status = "done"
            job.error_message = None
            await _set_resource_indexed(job, db, True)
        except Exception as exc:
            logger.exception("Embedding job %s failed", job_id)
            job.status = "error"
            job.error_message = _build_error_message(job, exc)
            await _set_resource_indexed(job, db, False)

        job.updated_at = datetime.utcnow()
        db.add(job)
        await db.commit()


async def _get_resource_text(job: EmbeddingJob, db) -> tuple[str | None, str]:
    from sqlmodel import select

    if job.resource_type == "note":
        from models.note import Note
        result = await db.exec(select(Note).where(Note.id == job.resource_id))
        note = result.first()
        if not note:
            raise ValueError(f"Note {job.resource_id} was not found.")
        if not note.content_md.strip():
            raise ValueError(
                f"Note {job.resource_id} has no content to embed. Add text before starting embeddings."
            )
        return note.title, note.content_md

    if job.resource_type == "pdf":
        from models.pdf import PDF
        result = await db.exec(select(PDF).where(PDF.id == job.resource_id))
        pdf = result.first()
        if not pdf:
            raise ValueError(f"PDF {job.resource_id} was not found.")
        if not pdf.extracted_text.strip():
            raise ValueError(
                f"PDF {job.resource_id} has no extracted text yet. Finish text extraction before starting embeddings."
            )
        return pdf.title, pdf.extracted_text

    if job.resource_type == "link":
        from models.link import Link
        result = await db.exec(select(Link).where(Link.id == job.resource_id))
        link = result.first()
        if not link:
            raise ValueError(f"Link {job.resource_id} was not found.")
        if not link.scraped_text.strip():
            raise ValueError(
                f"Link {job.resource_id} has no scraped content yet. Refresh the link content before starting embeddings."
            )
        return link.title, link.scraped_text

    raise ValueError(f"Unsupported resource type '{job.resource_type}'.")


async def _set_resource_indexed(
    job: EmbeddingJob,
    db,
    is_indexed: bool,
) -> None:
    model_map = {
        "note": Note,
        "pdf": PDF,
        "link": Link,
    }
    model = model_map.get(job.resource_type)
    if model is None:
        return

    result = await db.exec(select(model).where(model.id == job.resource_id))
    resource = result.first()
    if not resource:
        return

    resource.is_indexed = is_indexed
    db.add(resource)


def _build_error_message(job: EmbeddingJob, exc: Exception) -> str:
    if isinstance(exc, ValueError):
        return str(exc)
    if isinstance(exc, asyncio.TimeoutError):
        return "Embedding timed out while waiting for Gemini to return the vector."

    message = str(exc).strip()
    if "api key" in message.lower():
        return "Embedding failed because the Gemini API key is missing or invalid."
    if "timeout" in message.lower():
        return "Embedding timed out while waiting for the embedding provider to respond."
    if "429" in message or "rate limit" in message.lower():
        return "Embedding was rate-limited by the provider. Retry in a moment."
    if "403" in message or "permission" in message.lower():
        return "Embedding was rejected by the provider due to permission or access restrictions."

    return (
        f"Embedding failed for {job.resource_type} {job.resource_id} due to an unexpected backend error."
    )
