# NexusNote

## Overview

NexusNote is a workspace-based knowledge management and AI assistant web application. Users organize their knowledge into isolated workspaces — each containing text notes, uploaded PDFs, and scraped web links. A RAG-powered AI assistant within each workspace answers queries grounded strictly in that workspace's content. The product targets students and knowledge workers who want a unified place to store, browse, and query their research material.

## Goals

1. Allow users to build structured, multi-source knowledge bases organized into workspaces.
2. Provide a reliable RAG assistant whose context is always scoped to the active workspace.
3. Deliver a premium, distraction-free editing and querying experience across both dark and light themes.

## Core User Flow

1. User visits the landing page and signs up or logs in (credentials or Google OAuth).
2. On first login with no workspaces, a creation modal appears — user names and creates their first workspace, then is navigated into it.
3. On subsequent logins, the user lands on the dashboard of their most recently used workspace.
4. Inside a workspace, the top navbar shows three content tabs: **Notes**, **PDFs**, **Links**.
5. The left sidebar lists saved notes (on the Notes tab) or chat sessions (on the AI Assistant page).
6. **Notes tab**: User creates/opens TipTap text notes. Content is stored as Markdown. After editing, user can trigger "Create Embedding" to index the note into the workspace vector store.
7. **PDFs tab**: User uploads a PDF → file is stored on Cloudinary → text is extracted → user triggers "Create Embedding". The PDF list also supports in-app viewing of the original file.
8. **Links tab**: User pastes a URL → text is scraped from the page → user triggers "Create Embedding".
9. Embedding creation is processed by a FastAPI background worker. Completion is signalled to the frontend via SSE.
10. Removing any content item (note, PDF, or link) also deletes its corresponding vectors from pgvector.
11. User navigates to the **AI Assistant** page via sidebar icon — a chat interface with persistent sessions, all scoped to the current workspace's embeddings.
12. User can switch workspaces at any time from the top of the sidebar.

## Features

### Workspace Management

- Create, rename, and delete workspaces (max 5 per user).
- Workspace switcher at the top of the sidebar.
- Default to most recently used workspace on login.

### Notes

- Create, rename, and delete Markdown text notes.
- TipTap rich-text editor with Markdown storage.
- Per-note "Create Embedding" action to index content into pgvector.
- Notes listed in the sidebar within the workspace.

### PDFs

- Upload PDF → stored on Cloudinary → text extracted server-side.
- In-app PDF viewer using the Cloudinary URL.
- Per-PDF "Create Embedding" action.
- List of uploaded PDFs with view and delete options.
- Deletion removes Cloudinary asset and pgvector vectors.

### Links

- Paste a URL → server scrapes and stores extracted text.
- Per-link "Create Embedding" action.
- List of saved links with delete option.
- Deletion removes pgvector vectors for that resource.

### AI Assistant

- Dedicated chat page per workspace.
- Multiple named, persistent chat sessions per workspace.
- RAG retrieval scoped strictly to the active workspace's vectors.
- LLM: `gemini-2.0-flash` via Google Generative AI SDK.
- Chat sessions can be renamed and deleted.
- Chat history persisted in the database.

### Embedding Pipeline

- Background worker in FastAPI processes embedding jobs.
- Embedding model: Google Gemini text-embedding model.
- Vectors stored in Neon PostgreSQL with pgvector extension.
- SSE endpoint streams job status (pending → processing → done / error) to the frontend.

### Auth

- Email/password credentials.
- Google OAuth.
- JWT-based session management handled entirely by FastAPI.

## Scope

### In Scope

- Web app (Next.js frontend + FastAPI backend) in a Turborepo monorepo.
- Workspace-scoped RAG with Notes, PDFs, and Links as source types.
- TipTap editor with Markdown persistence.
- Cloudinary for PDF storage and serving.
- Neon PostgreSQL + pgvector for relational data and vector search.
- SSE-based embedding job notifications.
- Dark / light theme toggle.
- Google OAuth + credentials auth.

### Out of Scope

- Real-time collaboration or shared workspaces.
- Mobile native app.
- Workspace sharing or access control beyond the owner.
- Audio, video, or image content types.
- Billing or subscription tiers.
- Export / import of workspace data.

## Success Criteria

1. A signed-in user can create up to 5 workspaces and switch between them seamlessly.
2. A note, PDF, or link can be indexed via "Create Embedding" and the SSE notification confirms completion within a reasonable time.
3. The AI assistant returns answers grounded in the current workspace's content and produces no responses based on content from another workspace.
4. Deleting a resource removes its vectors from pgvector cleanly with no orphaned rows.
5. The app is fully functional in both dark and light themes without layout regressions.
