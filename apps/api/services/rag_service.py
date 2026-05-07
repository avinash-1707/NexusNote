from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

import google.generativeai as genai

from core.config import settings
from models.chat import ChatMessage
from services.embedding_service import similarity_search

CHAT_MODEL = "gemini-2.0-flash"
SYSTEM_PROMPT = (
    "You are a helpful AI assistant. Answer questions strictly based on the "
    "provided context. If the answer is not in the context, say so clearly. "
    "Do not make up information."
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
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history = history_result.all()

    context = "\n\n---\n\n".join(chunks) if chunks else "No relevant content found."
    user_message = f"Context:\n{context}\n\nQuestion: {query}"

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=CHAT_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )

    gemini_history = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg.content]})

    chat = model.start_chat(history=gemini_history)
    response = await chat.send_message_async(user_message)

    return response.text
