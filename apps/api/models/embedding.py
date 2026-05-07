from datetime import datetime, timezone
from typing import Optional, Literal

from sqlmodel import Field, SQLModel


class EmbeddingJob(SQLModel, table=True):
    __tablename__ = "embedding_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    resource_type: str  # "note" | "pdf" | "link"
    resource_id: int
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    status: str = Field(default="pending")  # pending | processing | done | error
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
