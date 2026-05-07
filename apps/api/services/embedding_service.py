import re
from typing import Literal

import google.generativeai as genai
from sqlalchemy import text
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.embedding import EmbeddingJob

ResourceType = Literal["note", "pdf", "link"]

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "models/text-embedding-004"
VECTOR_DIM = 768


def _tokenize_approx(text: str) -> list[str]:
    return re.findall(r"\S+", text)


def chunk_text(text: str) -> list[str]:
    words = _tokenize_approx(text)
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


async def embed_and_store(
    workspace_id: int,
    resource_type: ResourceType,
    resource_id: int,
    text: str,
    db: AsyncSession,
) -> None:
    genai.configure(api_key=settings.gemini_api_key)
    chunks = chunk_text(text)

    await delete_resource_chunks(workspace_id, resource_type, resource_id, db)

    for idx, chunk in enumerate(chunks):
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=chunk,
            task_type="retrieval_document",
        )
        vector = result["embedding"]
        vector_literal = f"[{','.join(str(v) for v in vector)}]"

        await db.exec(
            text(
                """
                INSERT INTO document_chunks
                  (workspace_id, resource_type, resource_id, chunk_index, content, embedding)
                VALUES
                  (:workspace_id, :resource_type, :resource_id, :chunk_index, :content, :embedding::vector)
                """
            ),
            {
                "workspace_id": workspace_id,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "chunk_index": idx,
                "content": chunk,
                "embedding": vector_literal,
            },
        )

    await db.commit()


async def delete_resource_chunks(
    workspace_id: int,
    resource_type: str,
    resource_id: int,
    db: AsyncSession,
) -> None:
    await db.exec(
        text(
            """
            DELETE FROM document_chunks
            WHERE workspace_id = :workspace_id
              AND resource_type = :resource_type
              AND resource_id = :resource_id
            """
        ),
        {
            "workspace_id": workspace_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
        },
    )
    await db.commit()


async def similarity_search(
    workspace_id: int,
    query: str,
    top_k: int = 5,
    db: AsyncSession = None,
) -> list[str]:
    genai.configure(api_key=settings.gemini_api_key)
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=query,
        task_type="retrieval_query",
    )
    vector = result["embedding"]
    vector_literal = f"[{','.join(str(v) for v in vector)}]"

    rows = await db.exec(
        text(
            """
            SELECT content
            FROM document_chunks
            WHERE workspace_id = :workspace_id
            ORDER BY embedding <=> :query_vec::vector
            LIMIT :top_k
            """
        ),
        {
            "workspace_id": workspace_id,
            "query_vec": vector_literal,
            "top_k": top_k,
        },
    )
    return [row[0] for row in rows]
