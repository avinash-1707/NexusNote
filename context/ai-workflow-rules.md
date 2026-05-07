# AI Workflow Rules

## Approach

Build NexusNote incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior not defined here. When in doubt, add an open question to `progress-tracker.md` and resolve it before writing code.

## Suggested Build Order

Work through phases in sequence. Do not start a phase until the previous one passes end-to-end.

1. **Phase 1 — Monorepo scaffold**: Turborepo setup, Next.js app, FastAPI app, shared config, environment variables wired up.
2. **Phase 2 — Database & models**: Neon connection, pgvector extension, all SQLModel table definitions, Alembic migrations.
3. **Phase 3 — Auth**: Register, login (credentials + Google OAuth), JWT issue/verify, `get_current_user` dependency, frontend auth context and protected routes.
4. **Phase 4 — Workspaces**: CRUD API + frontend workspace switcher, creation modal on first login, 5-workspace limit enforcement.
5. **Phase 5 — Notes**: Note CRUD API, TipTap editor page, Markdown persistence, sidebar note list.
6. **Phase 6 — PDFs**: Cloudinary upload, text extraction, PDF list + in-app viewer.
7. **Phase 7 — Links**: URL save, server-side scraping, link list.
8. **Phase 8 — Embedding pipeline**: `embedding_service.py` (chunk → embed → upsert), `embedding_worker.py`, `embedding_jobs` status tracking, SSE status endpoint, frontend `useEmbeddingStatus` hook, `<EmbeddingStatus />` component wired to Notes/PDFs/Links.
9. **Phase 9 — RAG chat**: `rag_service.py` (vector search + Gemini completion), chat session CRUD, chat message persistence, chat UI.
10. **Phase 10 — Deletion cleanup**: Verify that deleting any resource correctly removes pgvector rows and Cloudinary assets.
11. **Phase 11 — Polish**: Theme toggle, responsive layout, empty states, loading/error boundaries, landing page.

## Scoping Rules

- Work on one feature unit at a time — one router + one service + one page per implementation step.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single step.
- Do not implement a later phase while an earlier phase is broken or untested.

## When to Split Work

Split an implementation step if it combines:

- Backend service logic and frontend UI changes simultaneously (unless trivially simple).
- Multiple unrelated API routes in one step.
- Behavior not clearly defined in the context files.
- A migration and a new feature in the same step.

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- `apps/web/components/ui/*` — shadcn-generated UI primitives.
- Any generated migration file after it has been applied to the database.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or folder structure → `architecture.md`
- Storage model or schema → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope or user flow → `project-overview.md`
- UI tokens, layout, or component patterns → `ui-context.md`

Always update `progress-tracker.md` after completing any phase or meaningful sub-unit.

## Before Moving to the Next Phase

1. The current phase works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work and any decisions made.
4. `turbo run build` passes with no type errors.
5. No console errors or unhandled promise rejections in the browser.
