# NexusNote

Workspace-based knowledge management with a RAG-powered AI assistant. Store notes, PDFs, and web links — then query them in natural language, scoped strictly to each workspace.

![Dark theme · Light theme available](https://img.shields.io/badge/theme-dark%20%2F%20light-6e6bff)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-async-009688)
![pgvector](https://img.shields.io/badge/pgvector-Neon-blue)

---

## Features

| Area | What it does |
|---|---|
| **Workspaces** | Create up to 5 isolated workspaces; switch via top nav |
| **Notes** | TipTap rich-text editor, Markdown persistence, auto-save (1.5 s debounce) |
| **PDFs** | Drag-drop upload → Cloudinary storage → text extraction → in-app viewer |
| **Links** | Paste URL → server scrapes content → indexed for search |
| **Embeddings** | Per-resource "Create Embedding" → background job → SSE status notification |
| **AI Assistant** | Multi-session RAG chat with Gemini 2.0 Flash, context locked to workspace vectors |
| **Auth** | Email/password + Google OAuth, JWT sessions |
| **Themes** | Dark (default) / Light toggle via `next-themes` |

---

## Stack

### Frontend (`apps/web`)
- **Next.js 14** (App Router, TypeScript)
- **TanStack Query v5** — all server state, global 401 → logout handler
- **TipTap** — rich-text editor with `tiptap-markdown`
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **next-themes** — `data-theme` attribute dark/light system
- Fonts: Inter + JetBrains Mono

### Backend (`apps/api`)
- **FastAPI** (fully async Python)
- **SQLModel** (SQLAlchemy + Pydantic v2) + **Alembic** migrations
- **Neon PostgreSQL** + **pgvector** — relational data + `vector(768)` embeddings
- **Cloudinary** — PDF binary storage and serving
- **Google Gemini** — `text-embedding-004` for vectorisation, `gemini-2.0-flash` for chat
- **SSE** (sse-starlette) — real-time embedding job status
- **FastAPI BackgroundTasks** — async embedding pipeline

### Monorepo
- **Turborepo** — unified `build`, `dev`, `lint`, `typecheck` pipeline

---

## Project Structure

```
nexusnote/
├── apps/
│   ├── web/                        # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (marketing)/        # Landing page
│   │   │   ├── (auth)/             # Login / Signup
│   │   │   └── (app)/
│   │   │       └── workspace/[workspaceId]/
│   │   │           ├── layout.tsx  # Workspace shell (nav + sidebar)
│   │   │           ├── notes/
│   │   │           ├── pdfs/
│   │   │           ├── links/
│   │   │           └── assistant/
│   │   ├── components/             # UI components + shadcn/ui
│   │   ├── hooks/                  # useEmbeddingStatus (SSE)
│   │   ├── lib/                    # api.ts, queries.ts, types.ts, auth.ts
│   │   └── providers/              # QueryProvider, AuthProvider
│   └── api/                        # FastAPI
│       ├── core/                   # config, database, security, dependencies
│       ├── models/                 # SQLModel table definitions
│       ├── routers/                # HTTP boundary — auth, workspaces, notes, pdfs, links, embeddings, chat
│       ├── services/               # Business logic — embedding, RAG, PDF, link, auth
│       └── workers/                # BackgroundTask embedding worker
├── context/                        # Architecture + coding standards docs
├── turbo.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- A [Neon](https://neon.tech) PostgreSQL database with the `pgvector` extension enabled
- [Cloudinary](https://cloudinary.com) account
- [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- *(Optional)* Google OAuth credentials for social login

---

### 1. Clone and install

```bash
git clone https://github.com/avinash-1707/NexusNote.git
cd NexusNote
npm install          # installs web deps via Turborepo workspaces
```

---

### 2. Configure the API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/nexusnote
SECRET_KEY=your-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

GOOGLE_CLIENT_ID=          # optional, for Google OAuth
GOOGLE_CLIENT_SECRET=      # optional

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=
```

Run the database migration:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

### 3. Configure the web app

```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
# App available at http://localhost:3000
```

---

### 4. Run everything together (Turborepo)

From the monorepo root:

```bash
npm run dev
# Starts both apps/web and apps/api in parallel
```

---

## Core Flows

### Embedding a resource

1. Create/upload a note, PDF, or link in any workspace tab.
2. Click **Create Embedding** on the item.
3. A background job starts — a spinner shows "Indexing…".
4. SSE streams status updates until the job completes with a green checkmark.
5. The resource is now queryable by the AI assistant.

### AI Assistant

1. Navigate to **AI Assistant** (Brain icon in the top nav).
2. Create a new chat session.
3. Ask any question — retrieval is scoped strictly to the current workspace's vectors.
4. Sessions are persistent; rename or delete them from the sidebar.

---

## Architecture Notes

- **Workspace isolation is enforced at the database layer** — every pgvector query includes `WHERE workspace_id = :id`. Cross-workspace leakage is architecturally impossible.
- **Deletion cascades** — deleting a note, PDF, or link removes its `document_chunks` rows and, for PDFs, the Cloudinary asset.
- **No business logic in routers** — all logic lives in `services/`. Routers handle auth, validation, and response shaping only.
- **Token in localStorage** — JWT stored client-side; a global 401 handler in TanStack Query's `QueryCache` auto-logs out on expiry.
- **SSE over WebSockets** — simpler for one-directional job status; no persistent connection needed.

---

## Database Schema

```
users               id, email, hashed_password, google_id, created_at
workspaces          id, user_id, name, created_at, updated_at
notes               id, workspace_id, title, content_md, created_at, updated_at
pdfs                id, workspace_id, title, cloudinary_url, extracted_text, created_at
links               id, workspace_id, url, title, scraped_text, created_at
embedding_jobs      id, resource_type, resource_id, workspace_id, status, created_at, updated_at
chat_sessions       id, workspace_id, title, created_at, updated_at
chat_messages       id, session_id, role, content, created_at
document_chunks     id, workspace_id, resource_type, resource_id, chunk_index, content, embedding vector(768)
```

---

## License

MIT
