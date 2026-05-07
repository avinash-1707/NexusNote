from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
from sqlmodel import Field, SQLModel


class DocumentChunk(SQLModel, table=True):
    __tablename__ = "document_chunks"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(index=True)
    resource_type: str
    resource_id: int
    chunk_index: int
    content: str
    embedding: list[float] = Field(sa_column=Column(Vector(768)))
