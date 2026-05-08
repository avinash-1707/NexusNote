import re
from typing import Literal

from google import genai
from google.genai import types
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.embedding import EmbeddingJob

ResourceType = Literal["note", "pdf", "link"]

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "text-embedding-004"
VECTOR_DIM = 768

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


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
    client = _get_client()
    chunks = chunk_text(text)

    await delete_resource_chunks(workspace_id, resource_type, resource_id, db)

    for idx, chunk in enumerate(chunks):
        result = await client.aio.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=chunk,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        vector = result.embeddings[0].values
        vector_literal = f"[{','.join(str(v) for v in vector)}]"

        await db.exec(
            text(
                """
                INSERT INTO document_chunks
                  (workspace_id, resource_type, resource_id, chunk_index, content, embedding)
                VALUES
                  (:workspace_id, :resource_type, :resource_id, :chunk_index, :content, :embedding::vector)
                """
            ).bindparams(
                workspace_id=workspace_id,
                resource_type=resource_type,
                resource_id=resource_id,
                chunk_index=idx,
                content=chunk,
                embedding=vector_literal,
            )
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
        ).bindparams(
            workspace_id=workspace_id,
            resource_type=resource_type,
            resource_id=resource_id,
        )
    )
    await db.commit()


async def similarity_search(
    workspace_id: int,
    query: str,
    top_k: int = 5,
    db: AsyncSession = None,
) -> list[str]:
    client = _get_client()
    result = await client.aio.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    vector = result.embeddings[0].values
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
        ).bindparams(
            workspace_id=workspace_id,
            query_vec=vector_literal,
            top_k=top_k,
        )
    )
    return [row[0] for row in rows]
