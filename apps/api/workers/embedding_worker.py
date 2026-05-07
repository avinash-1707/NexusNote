from datetime import datetime, timezone

from sqlmodel import select

from core.database import AsyncSessionLocal
from models.embedding import EmbeddingJob


async def run_embedding_job(job_id: int) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.exec(select(EmbeddingJob).where(EmbeddingJob.id == job_id))
        job = result.first()
        if not job:
            return

        job.status = "processing"
        job.updated_at = datetime.now(timezone.utc)
        db.add(job)
        await db.commit()

        try:
            text = await _get_resource_text(job, db)
            from services.embedding_service import embed_and_store
            await embed_and_store(job.workspace_id, job.resource_type, job.resource_id, text, db)

            job.status = "done"
        except Exception:
            job.status = "error"

        job.updated_at = datetime.now(timezone.utc)
        db.add(job)
        await db.commit()


async def _get_resource_text(job: EmbeddingJob, db) -> str:
    from sqlmodel import select

    if job.resource_type == "note":
        from models.note import Note
        result = await db.exec(select(Note).where(Note.id == job.resource_id))
        note = result.first()
        return note.content_md if note else ""

    if job.resource_type == "pdf":
        from models.pdf import PDF
        result = await db.exec(select(PDF).where(PDF.id == job.resource_id))
        pdf = result.first()
        return pdf.extracted_text if pdf else ""

    if job.resource_type == "link":
        from models.link import Link
        result = await db.exec(select(Link).where(Link.id == job.resource_id))
        link = result.first()
        return link.scraped_text if link else ""

    return ""
