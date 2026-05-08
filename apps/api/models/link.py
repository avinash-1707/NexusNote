from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Link(SQLModel, table=True):
    __tablename__ = "links"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    url: str
    title: str = Field(default="")
    scraped_text: str = Field(default="")
    is_indexed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
