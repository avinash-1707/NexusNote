from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class PDF(SQLModel, table=True):
    __tablename__ = "pdfs"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    title: str
    cloudinary_url: str
    cloudinary_public_id: str
    extracted_text: str = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
