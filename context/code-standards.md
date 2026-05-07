# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds or defensive hacks.
- Do not mix unrelated concerns in one component, route, or service.
- Prefer explicit over implicit: name things by what they do, not where they live.
- Delete dead code immediately rather than commenting it out.

## TypeScript (Frontend — `apps/web`)

- Strict mode is required. `"strict": true` in `tsconfig.json`.
- No `any`. Use explicit interfaces or `unknown` with narrowing.
- Validate and type all API responses at the boundary using shared types or `zod`.
- Server components are the default — only add `"use client"` when browser interactivity is required.
- All data fetching in Server Components uses `fetch` with appropriate caching strategies.
- Client-side API calls use a typed wrapper in `apps/web/lib/api.ts` that attaches the JWT and handles errors uniformly.
- SSE connections are managed in a single `useEmbeddingStatus` custom hook — never inline.

## Next.js (App Router)

- Default to React Server Components; push `"use client"` as far down the tree as possible.
- Route handlers in `app/api/` are only used for auth callbacks (Google OAuth). All other data fetching hits the FastAPI backend directly.
- Loading states: use `loading.tsx` files and `<Suspense>` boundaries, not manual loading flags where avoidable.
- Error states: use `error.tsx` boundaries for route-level errors.
- Keep `layout.tsx` files focused on shell chrome only — no data fetching inside layouts except the root user session check.

## Python (Backend — `apps/api`)

- FastAPI with `async def` throughout — no synchronous route handlers or service functions.
- Pydantic v2 (bundled with SQLModel). All request bodies and response models are explicit Pydantic models.
- Use `pydantic-settings` for all environment config — no `os.environ.get()` scattered in code. Config lives in `core/config.py`.
- Use `sqlmodel` for DB models. Never write raw SQL except for pgvector similarity search queries in `embedding_service.py`.
- Dependency injection via FastAPI `Depends()` for DB sessions (`get_db`) and current user (`get_current_user`).
- All service functions are `async def` and accept a `db: AsyncSession` parameter — no module-level DB state.

## Styling

- Use CSS custom property tokens defined in `ui-context.md` — no hardcoded hex values, no hardcoded pixel values outside of the design system.
- Tailwind utility classes are the primary styling mechanism.
- No inline `style=` props except for dynamic values that cannot be expressed in Tailwind (e.g., dynamic width percentages).
- shadcn/ui components are not modified directly — extend via Tailwind `className` props or wrapper components.
- Dark/light theming is achieved purely through CSS variable reassignment under `[data-theme="light"]` — no Tailwind `dark:` variants on color classes.

## API Design (FastAPI Routers)

- Every protected route must call `get_current_user` via `Depends()` as the first dependency.
- Workspace ownership is verified inside the router before passing to the service layer — never assume the resource belongs to the user.
- Request input is validated by Pydantic before any logic runs.
- Response shapes are defined as explicit Pydantic response models — never return raw SQLModel table objects.
- All mutations return the updated resource or a `{"ok": true}` confirmation — never return `204 No Content` for deletes, to keep the frontend consistent.
- HTTP status codes: `200` OK, `201` Created, `400` validation/business error, `401` unauthenticated, `403` forbidden (ownership), `404` not found, `422` Pydantic validation error (automatic).

## Data and Storage

- Relational metadata (ownership, relationships, status, text content) belongs in Neon PostgreSQL via SQLModel.
- Vectors belong exclusively in the `document_chunks` table via pgvector — never in any other table or external store.
- PDF binaries belong on Cloudinary — never in the database.
- Do not store duplicate copies of content: `notes.content_md`, `pdfs.extracted_text`, and `links.scraped_text` are the single source of truth for raw text; `document_chunks` is the single source for indexed/vectorized text.
- All Cloudinary and pgvector cleanup on resource deletion must happen inside `services/` within the same logical operation — never left to the caller.

## Embedding Pipeline

- Chunking strategy: split text into chunks of ~500 tokens with ~50-token overlap. Logic lives in `embedding_service.py`.
- Each chunk row in `document_chunks` must carry: `workspace_id`, `resource_type`, `resource_id`, `chunk_index`, `content` (text), `embedding` (vector).
- The `embedding_job` status transitions are: `pending → processing → done | error`. No other states.
- SSE events emitted by the status endpoint: `{ event: "status", data: "pending" | "processing" | "done" | "error" }`.

## File Organization

- `apps/web/app/` — Next.js App Router pages and layouts only. No utility logic.
- `apps/web/components/` — Reusable React components. `components/ui/` is shadcn-generated (do not edit). `components/` root is project components.
- `apps/web/lib/` — Utility functions, API client wrapper, custom hooks, TipTap config.
- `apps/api/routers/` — HTTP boundary only: auth, validation, ownership check, delegate to service.
- `apps/api/services/` — All business logic. One file per domain.
- `apps/api/models/` — SQLModel table definitions only. No logic.
- `apps/api/core/` — Config, DB engine, security utilities, shared dependencies.
