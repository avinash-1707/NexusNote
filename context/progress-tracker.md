# Progress Tracker

## Current Phase

Phase 10 — Deletion cleanup + polish

## Current Goal

Verify deletion cascades (pgvector rows + Cloudinary assets removed on note/PDF/link delete), add loading.tsx / error.tsx boundaries, polish responsive layout.

## Completed

### Phase 1 — Monorepo scaffold
- Turborepo root, Next.js 14 App Router, TypeScript strict, Tailwind with CSS variable design tokens, `next-themes` dark default, Inter + JetBrains Mono fonts.
- All shadcn/ui components (button, input, label, dialog, dropdown-menu, scroll-area, separator, avatar, tooltip).
- `lib/utils.ts`, `lib/api.ts` (typed fetch wrapper with ApiError).
- `components/ThemeToggle.tsx`, `components/EmbeddingStatus.tsx`.
- All route page scaffolds compiled.

### Phase 2 — Database & models
- All SQLModel table definitions (user, workspace, note, pdf, link, embedding_job, chat_session, chat_message, document_chunk with pgvector Vector(768)).
- Alembic setup + `0001_initial.py` migration (pgvector extension + all tables).
- `core/`: config (pydantic-settings), database (async engine), security (JWT + bcrypt), dependencies (get_current_user).

### Phase 3 — Auth backend
- `routers/auth.py`: POST `/auth/register`, POST `/auth/login`.
- All services: embedding, RAG (Gemini 2.0 Flash), PDF (Cloudinary + pypdf), link (httpx + BeautifulSoup).
- Embedding worker (BackgroundTask driver).
- All routers wired into `main.py`.

### Phase 3 — Auth frontend
- `@tanstack/react-query` v5 installed.
- `lib/types.ts` — all shared TypeScript types.
- `lib/auth.ts` — localStorage token store (get/set/remove).
- `providers/QueryProvider.tsx` — QueryClient with global 401 → logout handler via QueryCache.
- `providers/AuthProvider.tsx` — auth context (token, isAuthenticated, login, logout).
- Root layout wraps with QueryProvider + AuthProvider.
- `app/(app)/layout.tsx` — auth guard: redirects to `/login` if not authenticated.
- Login + signup pages connected to API via `useLogin` / `useRegister` mutations; redirects to `/dashboard` on success.

### Phase 4 — Workspaces
- `lib/queries.ts` — full TanStack Query hook library: useWorkspaces, useCreateWorkspace, useRenameWorkspace, useDeleteWorkspace, useNotes, useNote, useCreateNote, useUpdateNote, useRenameNote, useDeleteNote, usePDFs, useDeletePDF, useLinks, useSaveLink, useDeleteLink, useCreateEmbedding, useChatSessions, useCreateSession, useRenameSession, useDeleteSession, useChatMessages, useSendMessage.
- `components/WorkspaceCreateModal.tsx` — creation modal with error handling (first workspace flow + add workspace flow).
- `app/(app)/dashboard/page.tsx` — post-login redirect page: fetches workspaces, redirects to first or shows creation modal.
- Workspace shell layout fully wired: real workspace list in switcher (max 5 enforcement), real notes list + chat session list in sidebar, `+ New Note` / `+ New Chat` create and navigate, rename/delete via DropdownMenu context menus, loading skeletons.
- `hooks/useEmbeddingStatus.ts` — SSE hook (EventSource, status transitions, auto-close on done/error).

### Phase 5 — Notes (TipTap editor + auto-save)
- TipTap editor with StarterKit + tiptap-markdown + Placeholder extension.
- Debounced auto-save (1.5s) via `useRef` + `setTimeout` + `useUpdateNote`.
- `editorInitialized` ref prevents overwriting edits on re-render; `setContent(md, { emitUpdate: false })` on first load.
- Toolbar: Bold, Italic, H1, H2, BulletList, OrderedList, Blockquote, InlineCode with active state styling.
- `useCreateEmbedding` + `useEmbeddingStatus` (SSE) wired into note page.
- ProseMirror styles in globals.css.

### Phase 6 — PDFs
- Drag-drop upload zone via `useUploadPDF` (multipart FormData).
- Grid of `PDFCard` sub-components, each with independent `useEmbeddingStatus`.
- PDF viewer: Dialog with iframe.

### Phase 7 — Links
- URL input wired to `useSaveLink`; inline error display on failure.
- List of `LinkItem` sub-components, each with independent `useEmbeddingStatus`.
- Open link + delete actions per row.

### Phase 9 — Chat
- `useChatMessages` loads history on mount.
- `useSendMessage` mutation for sending.
- Uncontrolled textarea via `useRef`; auto-height resize on input.
- Scroll-to-bottom on new message + while pending.
- Typing indicator (animated dots) while `isPending`.
- Workspace name from `useWorkspaces()` in header badge.

## In Progress

- Phase 10: Deletion cleanup + polish.

## Landing Page Revamp (Modern Playfulism)

Completed full aesthetic overhaul of `app/(marketing)/`. New design system layered on top of existing app tokens without interference.

**Files changed:**
- `app/globals.css` — Added `--lp-*` CSS variables (Cyprus+Sand light / dark modes), 6 keyframe animations, utility classes (`.lp-blob`, `.lp-reveal`, `.lp-glass`, `.lp-glow-btn`, etc.), and responsive bento grid helpers
- `tailwind.config.ts` — Added 12 `lp-*` color tokens
- `app/(marketing)/layout.tsx` — Bricolage Grotesque + DM Sans fonts, `LandingNav` client component
- `app/(marketing)/page.tsx` — Thin composition page
- `components/marketing/LandingNav.tsx` — Glassmorphism nav with scroll detection
- `components/marketing/HeroSection.tsx` — Cyprus/Sand hero + floating `KnowledgeOrb` SVG (claymorphism), mesh gradient blobs, staggered fade-ups, glowing CTA
- `components/marketing/FeaturesSection.tsx` — 3-col bento grid with mixed card spans, inline chat/code previews, glassmorphism card, scroll reveals
- `components/marketing/HowItWorksSection.tsx` — 3-step numbered flow, iridescent connector, scroll reveals
- `components/marketing/FooterCTASection.tsx` — Dark Cyprus moody section, oversized "N" watermark, warm sand accents
- `components/marketing/LandingFooter.tsx` — Minimal dark footer

## Next Up

- Verify delete cascades: note/PDF/link delete removes pgvector chunks + Cloudinary asset.
- Add `loading.tsx` + `error.tsx` route boundaries.
- Responsive layout polish.
- End-to-end test with real API.

## Open Questions

- None currently.

## Architecture Decisions

- **TanStack Query v5** for all client-side data fetching — centralized query key factory (`qk`), global 401 handler in QueryCache.
- **Token in localStorage** (not cookies) — simpler for JWT-based API; no httpOnly cookie complexity needed for this scope.
- **`/dashboard` redirect page** rather than `(app)/page.tsx` — avoids route group collision with `(marketing)/page.tsx` at `/`.
- **Inline `RenameDialog`** in workspace layout — avoids a separate Dialog import for a simple rename input.
- pgvector, FastAPI BackgroundTasks, Cloudinary, SSE over WebSockets — see previous decisions.

## Session Notes

- Run API: `cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload`
- Run web: `cd apps/web && npm run dev`
- Set `apps/api/.env` from `.env.example` before starting API.
- Apply DB migration: `cd apps/api && alembic upgrade head`
- `tsc --noEmit` passes after Phase 5–9 (two fixes: `editor.storage` double cast, `setContent` options object).
- `turbo run build` passes through Phase 4.
