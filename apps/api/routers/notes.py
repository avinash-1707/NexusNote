from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from models.note import Note
from models.user import User
from models.workspace import Workspace
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/notes", tags=["notes"])


class NoteCreate(BaseModel):
    title: str


class NoteUpdate(BaseModel):
    title: str | None = None
    content_md: str | None = None


class NoteResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    content_md: str
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=list[NoteResponse])
async def list_notes(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(select(Note).where(Note.workspace_id == workspace_id))
    return result.all()


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    workspace_id: int,
    body: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    note = Note(workspace_id=workspace_id, title=body.title)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    workspace_id: int,
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    return await _get_note(note_id, workspace_id, db)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    workspace_id: int,
    note_id: int,
    body: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    note = await _get_note(note_id, workspace_id, db)

    if body.title is not None:
        note.title = body.title
    if body.content_md is not None:
        note.content_md = body.content_md

    note.updated_at = datetime.utcnow()
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{note_id}")
async def delete_note(
    workspace_id: int,
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    note = await _get_note(note_id, workspace_id, db)

    from services.embedding_service import delete_resource_chunks
    await delete_resource_chunks(workspace_id, "note", note_id, db)

    await db.delete(note)
    await db.commit()
    return {"ok": True}


async def _get_note(note_id: int, workspace_id: int, db: AsyncSession) -> Note:
    result = await db.exec(
        select(Note).where(Note.id == note_id, Note.workspace_id == workspace_id)
    )
    note = result.first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note
