from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class EmbeddingJob(SQLModel, table=True):
    __tablename__ = "embedding_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    resource_type: str  # "note" | "pdf" | "link"
    resource_id: int
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    status: str = Field(default="pending")  # pending | processing | done | error
    error_message: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
