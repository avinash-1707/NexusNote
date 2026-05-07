# Architecture Context

## Monorepo Structure (Turborepo)

```
nexusnote/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   └── api/          # FastAPI backend
├── packages/
│   └── types/        # Shared TypeScript types (optional, future use)
├── turbo.json
└── package.json
```

## Stack

| Layer           | Technology                              | Role                                              |
| --------------- | --------------------------------------- | ------------------------------------------------- |
| Frontend        | Next.js 14 (App Router) + TypeScript    | UI, routing, SSE consumption                      |
| Styling         | Tailwind CSS + shadcn/ui                | Component library and design tokens               |
| Rich Text       | TipTap                                  | Note editor with Markdown serialization           |
| Backend         | FastAPI (Python, fully async)           | REST API, background workers, SSE                 |
| Auth            | FastAPI + python-jose (JWT)             | Credentials + Google OAuth, JWT session           |
| ORM / Models    | SQLModel (SQLAlchemy + Pydantic v2)     | DB schema, query layer                            |
| Database        | Neon PostgreSQL + pgvector              | Relational data + vector embeddings               |
| File Storage    | Cloudinary                              | PDF upload, storage, and serving                  |
| LLM             | Gemini 2.0 Flash (`gemini-2.0-flash`)   | Chat completions for RAG assistant                |
| Embeddings      | Gemini Embedding (`text-embedding-004`) | Text vectorization for all source types           |
| Background Jobs | FastAPI `BackgroundTasks`               | Async embedding pipeline per resource             |
| Realtime        | SSE (FastAPI → Next.js)                 | Embedding job status notifications                |
| Monorepo        | Turborepo                               | Unified build, dev, and lint pipeline             |

## App Router Routes (Next.js — `apps/web`)

```
app/
├── (marketing)/
│   └── page.tsx                  # Landing page
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   └── workspace/
│       └── [workspaceId]/
│           ├── layout.tsx        # Workspace shell: top navbar + sidebar
│           ├── notes/
│           │   ├── page.tsx      # Notes list (empty state)
│           │   └── [noteId]/
│           │       └── page.tsx  # TipTap editor for a note
│           ├── pdfs/
│           │   └── page.tsx      # PDF list + viewer + upload
│           ├── links/
│           │   └── page.tsx      # Link input + list
│           └── assistant/
│               ├── page.tsx      # Chat session list / new session
│               └── [sessionId]/
│                   └── page.tsx  # Active chat session
└── layout.tsx                    # Root layout (theme provider, auth context)
```

## API Structure (FastAPI — `apps/api`)

```
api/
├── main.py
├── core/
│   ├── config.py         # Settings via pydantic-settings
│   ├── database.py       # Async engine + session factory (Neon)
│   ├── security.py       # JWT encode/decode, password hashing
│   └── dependencies.py   # get_current_user, get_db
├── models/               # SQLModel table definitions
│   ├── user.py
│   ├── workspace.py
│   ├── note.py
│   ├── pdf.py
│   ├── link.py
│   ├── embedding.py      # Tracks embedding job status per resource
│   └── chat.py           # ChatSession + ChatMessage
├── routers/
│   ├── auth.py           # /auth/register, /auth/login, /auth/google
│   ├── workspaces.py     # CRUD for workspaces
│   ├── notes.py          # CRUD for notes
│   ├── pdfs.py           # Upload, list, delete, extract
│   ├── links.py          # Save, scrape, list, delete
│   ├── embeddings.py     # POST /embed/{resource_type}/{resource_id}, SSE status
│   └── chat.py           # Sessions + messages, RAG query
├── services/
│   ├── embedding_service.py   # Chunking, Gemini embed, pgvector upsert/delete
│   ├── rag_service.py         # Vector search + Gemini chat completion
│   ├── pdf_service.py         # Cloudinary upload + text extraction (pypdf)
│   ├── link_service.py        # URL scraping (httpx + BeautifulSoup)
│   └── auth_service.py        # Google OAuth token verification
└── workers/
    └── embedding_worker.py    # BackgroundTask that drives embedding_service
```

## System Boundaries

- `apps/web/` — All UI rendering, routing, theme, SSE client, API calls via typed fetch wrapper.
- `apps/api/routers/` — HTTP boundary: input validation (Pydantic), auth enforcement, response shaping. No business logic lives here.
- `apps/api/services/` — All business logic: embedding, RAG retrieval, file handling, scraping.
- `apps/api/models/` — Single source of truth for DB schema. No raw SQL outside of `database.py` and `embedding_service.py` (pgvector queries).
- `apps/api/workers/` — Background tasks only. Workers call services; they never access DB directly.

## Storage Model

- **Neon PostgreSQL (relational)**: Users, workspaces, notes (with Markdown content), PDF metadata (Cloudinary URL + extracted text), link metadata (URL + scraped text), embedding job status, chat sessions, chat messages.
- **Neon pgvector**: Embedding vectors for all indexed resources. Each vector row carries `workspace_id` and `resource_id` + `resource_type` for scoped retrieval and targeted deletion.
- **Cloudinary**: Original PDF binaries. Accessed via stored URL for in-app viewing. Deletion of a PDF triggers Cloudinary asset deletion + pgvector cleanup.

## Database Schema (Key Tables)

```
users               id, email, hashed_password, google_id, created_at
workspaces          id, user_id, name, created_at, updated_at
notes               id, workspace_id, title, content_md, created_at, updated_at
pdfs                id, workspace_id, title, cloudinary_url, extracted_text, created_at
links               id, workspace_id, url, title, scraped_text, created_at
embedding_jobs      id, resource_type (note|pdf|link), resource_id, workspace_id, status (pending|processing|done|error), created_at, updated_at
chat_sessions       id, workspace_id, title, created_at, updated_at
chat_messages       id, session_id, role (user|assistant), content, created_at
document_chunks     id, workspace_id, resource_type, resource_id, chunk_index, content, embedding vector(768)
```

## Auth and Access Model

- Every request to protected routes requires a valid JWT in the `Authorization: Bearer` header.
- JWT issued by FastAPI on login (credentials or Google OAuth callback).
- Every workspace, note, PDF, link, and chat session is owned by a single user.
- All router handlers verify `workspace.user_id == current_user.id` before any read or mutation.
- Cross-workspace access is never permitted — RAG retrieval always filters by `workspace_id`.

## SSE Flow (Embedding Jobs)

1. Frontend POSTs to `/embeddings/{resource_type}/{resource_id}` → backend enqueues `BackgroundTask`, creates `embedding_job` row with `status=pending`, returns `job_id`.
2. Frontend opens `GET /embeddings/status/{job_id}` as an SSE stream.
3. Worker updates `embedding_job.status` as it progresses; SSE handler polls the DB row and emits events.
4. Frontend closes the stream on `done` or `error` event and updates UI accordingly.

## Invariants

1. RAG retrieval must always include `WHERE workspace_id = :workspace_id` — no cross-workspace vector leakage.
2. Deleting any resource (note, PDF, link) must atomically delete its `document_chunks` rows and, for PDFs, its Cloudinary asset.
3. Route handlers do not contain business logic — all logic lives in `services/`.
4. No synchronous blocking I/O anywhere in `apps/api/` — use `async`/`await` throughout.
5. The `document_chunks` table is the single source for vector data — no vectors are stored anywhere else.
6. A user may not have more than 5 workspaces; this is enforced at the API layer before any insert.
7. Chat context is always assembled from the workspace's `document_chunks` — never from raw note/pdf/link content fields.
