import re

from google import genai
from google.genai import errors, types
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.chat import ChatMessage
from services.embedding_service import similarity_search

CHAT_HISTORY_LIMIT = 8
SYSTEM_PROMPT = (
    "You are a helpful AI assistant. Answer questions strictly based on the "
    "provided context. If the answer is not in the context, say so clearly. "
    "Do not make up information."
)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


class ChatQuotaExceededError(Exception):
    def __init__(self, message: str, retry_after_seconds: int | None = None):
        super().__init__(message)
        self.message = message
        self.retry_after_seconds = retry_after_seconds


def _get_chat_models() -> list[str]:
    models = [model.strip() for model in settings.gemini_chat_models.split(",") if model.strip()]
    return models or ["gemini-2.0-flash"]


def _is_quota_error(exc: errors.ClientError) -> bool:
    return exc.code == 429 or exc.status == "RESOURCE_EXHAUSTED"


def _extract_retry_after_seconds(exc: errors.ClientError) -> int | None:
    details = exc.details.get("error", {}).get("details", []) if isinstance(exc.details, dict) else []
    for detail in details:
        if detail.get("@type") == "type.googleapis.com/google.rpc.RetryInfo":
            retry_delay = detail.get("retryDelay", "")
            if retry_delay.endswith("s"):
                try:
                    return int(float(retry_delay[:-1]))
                except ValueError:
                    pass

    message = exc.message or ""
    match = re.search(r"retry in ([0-9]+(?:\.[0-9]+)?)s", message, flags=re.IGNORECASE)
    if match:
        return max(1, int(float(match.group(1))))
    return None


def _build_quota_message(models: list[str], retry_after_seconds: int | None) -> str:
    model_list = ", ".join(models)
    if retry_after_seconds is not None:
        return (
            f"Gemini chat quota is exhausted for the configured models ({model_list}). "
            f"Retry in about {retry_after_seconds} seconds or check Google AI Studio billing and quota."
        )
    return (
        f"Gemini chat quota is exhausted for the configured models ({model_list}). "
        "Check Google AI Studio billing and quota, or retry later."
    )


async def answer_query(
    workspace_id: int,
    query: str,
    session_id: int,
    db: AsyncSession,
) -> str:
    chunks = await similarity_search(workspace_id, query, top_k=5, db=db)

    history_result = await db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(CHAT_HISTORY_LIMIT)
    )
    history_msgs = list(reversed(history_result.all()))

    context = "\n\n---\n\n".join(chunks) if chunks else "No relevant content found."
    current_turn = types.Content(
        role="user",
        parts=[types.Part(text=f"Context:\n{context}\n\nQuestion: {query}")],
    )

    gemini_history = [
        types.Content(
            role="user" if msg.role == "user" else "model",
            parts=[types.Part(text=msg.content)],
        )
        for msg in history_msgs
    ]

    client = _get_client()
    retry_after_seconds: int | None = None
    models = _get_chat_models()

    for model in models:
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=[*gemini_history, current_turn],
                config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            )
            return response.text or ""
        except errors.ClientError as exc:
            if not _is_quota_error(exc):
                raise
            retry_after_seconds = _extract_retry_after_seconds(exc) or retry_after_seconds
            continue

    raise ChatQuotaExceededError(
        _build_quota_message(models, retry_after_seconds),
        retry_after_seconds=retry_after_seconds,
    )
