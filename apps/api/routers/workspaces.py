from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.workspace import Workspace

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

MAX_WORKSPACES = 5


class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceUpdate(BaseModel):
    name: str


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.exec(
        select(Workspace).where(Workspace.user_id == current_user.id)
    )
    return result.all()


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    body: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.exec(
        select(func.count()).where(Workspace.user_id == current_user.id)
    )
    count = count_result.one()
    if count >= MAX_WORKSPACES:
        raise HTTPException(status_code=400, detail="Maximum 5 workspaces allowed")

    workspace = Workspace(user_id=current_user.id, name=body.name)
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def rename_workspace(
    workspace_id: int,
    body: WorkspaceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workspace = await _get_owned_workspace(workspace_id, current_user.id, db)
    workspace.name = body.name
    workspace.updated_at = datetime.utcnow()
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workspace = await _get_owned_workspace(workspace_id, current_user.id, db)
    await db.delete(workspace)
    await db.commit()
    return {"ok": True}


async def _get_owned_workspace(
    workspace_id: int, user_id: int, db: AsyncSession
) -> Workspace:
    result = await db.exec(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return workspace
