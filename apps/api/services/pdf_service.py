import io

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from pypdf import PdfReader
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.pdf import PDF


def _configure_cloudinary() -> None:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )


async def upload_and_extract(
    workspace_id: int, file: UploadFile, db: AsyncSession
) -> PDF:
    _configure_cloudinary()

    contents = await file.read()

    upload_result = cloudinary.uploader.upload(
        contents,
        resource_type="raw",
        folder=f"nexusnote/workspace_{workspace_id}",
        public_id=file.filename,
    )

    extracted = _extract_text(contents)

    pdf = PDF(
        workspace_id=workspace_id,
        title=file.filename or "Untitled PDF",
        cloudinary_url=upload_result["secure_url"],
        cloudinary_public_id=upload_result["public_id"],
        extracted_text=extracted,
    )
    db.add(pdf)
    await db.commit()
    await db.refresh(pdf)
    return pdf


async def delete_pdf_assets(pdf: PDF, db: AsyncSession) -> None:
    _configure_cloudinary()
    cloudinary.uploader.destroy(pdf.cloudinary_public_id, resource_type="raw")

    from services.embedding_service import delete_resource_chunks
    await delete_resource_chunks(pdf.workspace_id, "pdf", pdf.id, db)


def _extract_text(contents: bytes) -> str:
    reader = PdfReader(io.BytesIO(contents))
    return "\n".join(
        page.extract_text() or "" for page in reader.pages
    )
