import asyncio
import re
from typing import Literal

from google import genai
from google.genai import types
from sqlalchemy import text as sql_text
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.embedding import EmbeddingJob

ResourceType = Literal["note", "pdf", "link"]

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "gemini-embedding-2"
VECTOR_DIM = 768
EMBEDDING_TIMEOUT_SECONDS = 45

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


def prepare_query(query: str) -> str:
    return f"task: search result | query: {query}"


def prepare_document(content: str, title: str | None = None) -> str:
    resolved_title = title.strip() if title and title.strip() else "none"
    return f"title: {resolved_title} | text: {content}"


async def embed_and_store(
    workspace_id: int,
    resource_type: ResourceType,
    resource_id: int,
    content: str,
    title: str | None,
    db: AsyncSession,
) -> None:
    client = _get_client()
    chunks = chunk_text(content)

    await delete_resource_chunks(workspace_id, resource_type, resource_id, db)

    for idx, chunk in enumerate(chunks):
        result = await asyncio.wait_for(
            client.aio.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=prepare_document(chunk, title=title),
                config=types.EmbedContentConfig(output_dimensionality=VECTOR_DIM),
            ),
            timeout=EMBEDDING_TIMEOUT_SECONDS,
        )
        vector = result.embeddings[0].values
        vector_literal = f"[{','.join(str(v) for v in vector)}]"

        await db.exec(
            sql_text(
                """
                INSERT INTO document_chunks
                  (workspace_id, resource_type, resource_id, chunk_index, content, embedding)
                VALUES
                  (:workspace_id, :resource_type, :resource_id, :chunk_index, :content, CAST(:embedding AS vector))
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
        sql_text(
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
    result = await asyncio.wait_for(
        client.aio.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=prepare_query(query),
            config=types.EmbedContentConfig(output_dimensionality=VECTOR_DIM),
        ),
        timeout=EMBEDDING_TIMEOUT_SECONDS,
    )
    vector = result.embeddings[0].values
    vector_literal = f"[{','.join(str(v) for v in vector)}]"

    rows = await db.exec(
        sql_text(
            """
            SELECT content
            FROM document_chunks
            WHERE workspace_id = :workspace_id
            ORDER BY embedding <=> CAST(:query_vec AS vector)
            LIMIT :top_k
            """
        ).bindparams(
            workspace_id=workspace_id,
            query_vec=vector_literal,
            top_k=top_k,
        )
    )
    return [row[0] for row in rows]
