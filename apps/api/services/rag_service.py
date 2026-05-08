from google import genai
from google.genai import types
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.config import settings
from models.chat import ChatMessage
from services.embedding_service import similarity_search

CHAT_MODEL = "gemini-2.0-flash"
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
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history_msgs = history_result.all()

    context = "\n\n---\n\n".join(chunks) if chunks else "No relevant content found."
    user_message = f"Context:\n{context}\n\nQuestion: {query}"

    gemini_history = [
        types.Content(
            role="user" if msg.role == "user" else "model",
            parts=[types.Part(text=msg.content)],
        )
        for msg in history_msgs
    ]

    client = _get_client()
    chat = client.aio.chats.create(
        model=CHAT_MODEL,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
        history=gemini_history,
    )
    response = await chat.send_message(user_message)

    return response.text
