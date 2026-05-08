from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.pdf import PDF
from models.user import User
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/pdfs", tags=["pdfs"])


class PDFResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    cloudinary_url: str
    is_indexed: bool
    created_at: datetime


@router.get("", response_model=list[PDFResponse])
async def list_pdfs(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(select(PDF).where(PDF.workspace_id == workspace_id))
    return result.all()


@router.post("", response_model=PDFResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    workspace_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)

    from services.pdf_service import upload_and_extract
    pdf = await upload_and_extract(workspace_id, file, db)
    return pdf


@router.delete("/{pdf_id}")
async def delete_pdf(
    workspace_id: int,
    pdf_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(
        select(PDF).where(PDF.id == pdf_id, PDF.workspace_id == workspace_id)
    )
    pdf = result.first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    from services.pdf_service import delete_pdf_assets
    await delete_pdf_assets(pdf, db)

    await db.delete(pdf)
    await db.commit()
    return {"ok": True}
