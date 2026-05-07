# UI Context

## Theme

Dual theme (dark / light) toggled by the user. Default is dark.  
Design language: **premium technical workspace** — clean geometry, generous whitespace, subtle depth through surface layering, and a single cool accent color for interactive elements. No gradients on structural chrome. Typography-forward with high contrast ratios.

Theme is managed via `next-themes` with a `ThemeProvider` at the root layout. All color values are CSS custom properties; Tailwind classes reference them via a custom theme extension.

## Fonts

| Role        | Font                  | Variable          | Source        |
| ----------- | --------------------- | ----------------- | ------------- |
| UI / Body   | **Inter**             | `--font-sans`     | `next/font/google` |
| Code / Mono | **JetBrains Mono**    | `--font-mono`     | `next/font/google` |

## Colors

All components must use these CSS custom properties — no hardcoded hex values anywhere.

### Dark Theme

| Role               | CSS Variable           | Value     |
| ------------------ | ---------------------- | --------- |
| Page background    | `--bg-base`            | `#0a0a0f` |
| Surface (cards)    | `--bg-surface`         | `#111118` |
| Surface elevated   | `--bg-surface-raised`  | `#18181f` |
| Border             | `--border-default`     | `#252530` |
| Border subtle      | `--border-subtle`      | `#1c1c26` |
| Primary text       | `--text-primary`       | `#f0f0f5` |
| Secondary text     | `--text-secondary`     | `#a0a0b0` |
| Muted text         | `--text-muted`         | `#60607a` |
| Primary accent     | `--accent-primary`     | `#6e6bff` |
| Accent hover       | `--accent-hover`       | `#5957e8` |
| Accent subtle bg   | `--accent-subtle`      | `#6e6bff18` |
| Error              | `--state-error`        | `#f56565` |
| Success            | `--state-success`      | `#48bb78` |
| Warning            | `--state-warning`      | `#ed8936` |

### Light Theme

| Role               | CSS Variable           | Value     |
| ------------------ | ---------------------- | --------- |
| Page background    | `--bg-base`            | `#f7f7fb` |
| Surface (cards)    | `--bg-surface`         | `#ffffff` |
| Surface elevated   | `--bg-surface-raised`  | `#f0f0f7` |
| Border             | `--border-default`     | `#e2e2ef` |
| Border subtle      | `--border-subtle`      | `#ebebf5` |
| Primary text       | `--text-primary`       | `#0f0f14` |
| Secondary text     | `--text-secondary`     | `#50506a` |
| Muted text         | `--text-muted`         | `#9090a8` |
| Primary accent     | `--accent-primary`     | `#5a57f0` |
| Accent hover       | `--accent-hover`       | `#4745d6` |
| Accent subtle bg   | `--accent-subtle`      | `#5a57f014` |
| Error              | `--state-error`        | `#e53e3e` |
| Success            | `--state-success`      | `#38a169` |
| Warning            | `--state-warning`      | `#dd6b20` |

## Border Radius

| Context              | Tailwind Class   | CSS Value  |
| -------------------- | ---------------- | ---------- |
| Inline / badges      | `rounded`        | `4px`      |
| Buttons / inputs     | `rounded-md`     | `6px`      |
| Cards / panels       | `rounded-lg`     | `8px`      |
| Modals / dialogs     | `rounded-xl`     | `12px`     |
| Full pill (avatar)   | `rounded-full`   | `9999px`   |

## Component Library

shadcn/ui on top of Tailwind CSS. Components live in `apps/web/components/ui/`. Use the shadcn CLI to add new primitives — do not write from scratch what shadcn provides. Customize via CSS variables above, not by modifying generated component files.

## Layout Patterns

### Workspace Shell (`/workspace/[workspaceId]/layout.tsx`)
- **Top Navbar** (full width, fixed): Logo/brand left, workspace switcher center-left, content tabs (Notes | PDFs | Links), AI Assistant icon button, theme toggle, and user avatar right.
- **Left Sidebar** (fixed, collapsible, `240px` wide): Visible only on the AI Assistant page. Lists chat sessions. On Notes/PDFs/Links tabs, the sidebar shows the notes list.
- **Main Content**: Remaining viewport. Scrollable. Padding `px-6 py-5`.

### Notes Tab
- Sidebar: list of notes with rename/delete context menu.
- Main: TipTap editor filling the content area. Toolbar at top. "Create Embedding" button top-right, disabled until content exists and enabled after edits.

### PDFs Tab
- No sidebar.
- Main: Upload zone at top, grid/list of uploaded PDFs below. Each PDF card has a view button (opens an in-app modal with the Cloudinary PDF viewer), a "Create Embedding" button, and a delete button.

### Links Tab
- No sidebar.
- Main: URL input field with a "Save Link" button at top. List of saved links below. Each link row shows title + URL, a "Create Embedding" button, and a delete button. "Create Embedding" appears only after the link is saved.

### AI Assistant Page
- Sidebar: list of chat sessions with rename/delete. "New Chat" button at top.
- Main: chat message thread + input box pinned to bottom. Workspace context indicator in the header.

### Modals / Overlays
- Centered with backdrop `blur-sm` and `bg-black/40`.
- Used for: workspace creation, workspace rename, PDF viewer.

### Landing Page
- Full-width marketing layout. No sidebar. Navbar with login/signup CTA.

## Icons

Lucide React. Stroke-based only. Sizes:
- `h-4 w-4` — inline text icons, list item icons
- `h-5 w-5` — buttons, nav items
- `h-6 w-6` — section headers, empty states

## Embedding Status Indicator

Reusable `<EmbeddingStatus />` component that displays the current job state:
- `idle` — "Create Embedding" button (accent color)
- `pending / processing` — spinner + "Indexing…" label (muted)
- `done` — checkmark icon + "Indexed" (success color)
- `error` — warning icon + "Retry" button (error color)
