from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from models.chat import ChatSession, ChatMessage
from models.user import User
from routers.workspaces import _get_owned_workspace

router = APIRouter(prefix="/workspaces/{workspace_id}/chat", tags=["chat"])


class SessionCreate(BaseModel):
    title: str = "New Chat"


class SessionUpdate(BaseModel):
    title: str


class SessionResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class MessageRequest(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    result = await db.exec(
        select(ChatSession).where(ChatSession.workspace_id == workspace_id)
    )
    return result.all()


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    workspace_id: int,
    body: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    session = ChatSession(workspace_id=workspace_id, title=body.title)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def rename_session(
    workspace_id: int,
    session_id: int,
    body: SessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    session = await _get_session(session_id, workspace_id, db)
    session.title = body.title
    session.updated_at = datetime.utcnow()
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(
    workspace_id: int,
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    session = await _get_session(session_id, workspace_id, db)
    await db.delete(session)
    await db.commit()
    return {"ok": True}


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    workspace_id: int,
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    await _get_session(session_id, workspace_id, db)
    result = await db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    return result.all()


@router.post("/sessions/{session_id}/messages", response_model=MessageResponse)
async def send_message(
    workspace_id: int,
    session_id: int,
    body: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_workspace(workspace_id, current_user.id, db)
    await _get_session(session_id, workspace_id, db)

    user_msg = ChatMessage(session_id=session_id, role="user", content=body.content)
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)

    from services.rag_service import answer_query
    reply = await answer_query(workspace_id, body.content, session_id, db)

    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=reply)
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg


async def _get_session(
    session_id: int, workspace_id: int, db: AsyncSession
) -> ChatSession:
    result = await db.exec(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.workspace_id == workspace_id,
        )
    )
    session = result.first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
