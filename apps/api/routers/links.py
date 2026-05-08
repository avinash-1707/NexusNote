from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.link import Link
from models.user import User
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/links", tags=["links"])


class LinkCreate(BaseModel):
    url: str


class LinkResponse(BaseModel):
    id: int
    workspace_id: int
    url: str
    title: str
    is_indexed: bool
    created_at: datetime


@router.get("", response_model=list[LinkResponse])
async def list_links(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(select(Link).where(Link.workspace_id == workspace_id))
    return result.all()


@router.post("", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def save_link(
    workspace_id: int,
    body: LinkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)

    from services.link_service import scrape_url
    link = await scrape_url(workspace_id, body.url, db)
    return link


@router.delete("/{link_id}")
async def delete_link(
    workspace_id: int,
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(
        select(Link).where(Link.id == link_id, Link.workspace_id == workspace_id)
    )
    link = result.first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    from services.embedding_service import delete_resource_chunks
    await delete_resource_chunks(workspace_id, "link", link_id, db)

    await db.delete(link)
    await db.commit()
    return {"ok": True}
