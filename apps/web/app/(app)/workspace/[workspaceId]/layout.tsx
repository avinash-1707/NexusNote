'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  Brain,
  ChevronDown,
  FileText,
  Link2,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import {
  useChatSessions,
  useCreateNote,
  useCreateSession,
  useDeleteNote,
  useDeleteSession,
  useNotes,
  useRenameNote,
  useRenameSession,
  useWorkspaces,
} from '@/lib/queries'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WorkspaceCreateModal } from '@/components/WorkspaceCreateModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ workspaceId: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const workspaceId = Number(params.workspaceId)
  const isAssistant = pathname.includes('/assistant')
  const showSidebar = pathname.includes('/notes') || isAssistant

  const [showCreateWs, setShowCreateWs] = useState(false)
  const [renaming, setRenaming] = useState<{ type: 'note' | 'session'; id: number; current: string } | null>(null)

  const { data: workspaces = [] } = useWorkspaces()
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)

  const { data: notes = [], isLoading: notesLoading } = useNotes(workspaceId)
  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions(workspaceId)

  const createNote = useCreateNote(workspaceId)
  const deleteNote = useDeleteNote(workspaceId)
  const updateNote = useRenameNote(workspaceId)

  const createSession = useCreateSession(workspaceId)
  const deleteSession = useDeleteSession(workspaceId)
  const renameSession = useRenameSession(workspaceId)

  const tabs = [
    { href: `/workspace/${workspaceId}/notes`, label: 'Notes', icon: StickyNote },
    { href: `/workspace/${workspaceId}/pdfs`, label: 'PDFs', icon: Upload },
    { href: `/workspace/${workspaceId}/links`, label: 'Links', icon: Link2 },
  ]

  const handleNewNote = async () => {
    const note = await createNote.mutateAsync('Untitled')
    router.push(`/workspace/${workspaceId}/notes/${note.id}`)
  }

  const handleNewSession = async () => {
    const session = await createSession.mutateAsync('New Chat')
    router.push(`/workspace/${workspaceId}/assistant/${session.id}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--lp-bg)', color: 'var(--lp-ink)' }}>
      {/* ─── Top Navbar ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center lp-glass"
        style={{ borderBottom: '1px solid var(--lp-border)' }}
      >
        {/* Left: logo + workspace — 240px to align with sidebar */}
        <div
          className="flex flex-col justify-center px-4 shrink-0 w-60 h-full gap-0.5"
          style={{ borderRight: '1px solid var(--lp-border)' }}
        >
          {/* App identity — top level */}
          <Link href="/" className="inline-flex items-center gap-1.5 group w-fit">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold lp-display transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            >
              N
            </div>
            <span className="lp-display font-medium text-xs" style={{ color: 'var(--lp-body)' }}>
              NexusNote
            </span>
          </Link>

          {/* Workspace — subordinate level */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 w-full lp-display text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--lp-ink)' }}
              >
                <span className="truncate max-w-[180px]">{currentWorkspace?.name ?? '…'}</span>
                <ChevronDown className="h-3 w-3 shrink-0" style={{ color: 'var(--lp-muted)' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  className={cn(ws.id === workspaceId && 'font-medium')}
                  style={ws.id === workspaceId ? { color: 'var(--lp-iris)' } : undefined}
                  onSelect={() => router.push(`/workspace/${ws.id}/notes`)}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              {workspaces.length < 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setShowCreateWs(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New workspace
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: tabs */}
        <nav className="flex-1 flex items-center justify-center gap-1 px-4">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full lp-display font-medium transition-colors"
                style={
                  isActive
                    ? { color: 'var(--lp-ink)', backgroundColor: 'rgba(167,139,250,0.12)' }
                    : { color: 'var(--lp-body)' }
                }
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: AI + theme + avatar */}
        <div className="flex items-center gap-1 px-4 shrink-0">
          <Link href={`/workspace/${workspaceId}/assistant`}>
            <button
              className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold lp-display transition-all"
              style={
                isAssistant
                  ? { color: 'var(--lp-iris)', backgroundColor: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.45)' }
                  : { color: 'var(--lp-iris)', backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)' }
              }
              aria-label="AI Assistant"
            >
              <Brain className="h-3.5 w-3.5" />
              Ask AI
            </button>
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold lp-display transition-opacity hover:opacity-70"
                style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
                aria-label="User menu"
              >
                U
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-state-error" onSelect={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── Sidebar ─── */}
      {showSidebar && <aside
        className="fixed left-0 top-14 bottom-0 w-60 flex flex-col z-40"
        style={{ borderRight: '1px solid var(--lp-border)', backgroundColor: 'var(--lp-bg)' }}
      >
        <div className="p-3 shrink-0">
          {isAssistant ? (
            <button
              onClick={handleNewSession}
              disabled={createSession.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold lp-display disabled:opacity-60 transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          ) : (
            <button
              onClick={handleNewNote}
              disabled={createNote.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold lp-display disabled:opacity-60 transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          )}
        </div>

        <div className="h-px mx-3 shrink-0" style={{ backgroundColor: 'var(--lp-border)' }} />

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {isAssistant ? (
              sessionsLoading ? (
                <SidebarSkeleton />
              ) : sessions.length === 0 ? (
                <p className="text-xs text-center py-8 px-3" style={{ color: 'var(--lp-muted)' }}>
                  No sessions yet
                </p>
              ) : (
                sessions.map((session) => {
                  const isActive = pathname.includes(`/assistant/${session.id}`)
                  return (
                    <SidebarItem
                      key={session.id}
                      label={session.title}
                      href={`/workspace/${workspaceId}/assistant/${session.id}`}
                      isActive={isActive}
                      icon={<Brain className="h-3.5 w-3.5 shrink-0" />}
                      onDelete={() => deleteSession.mutate(session.id)}
                      onRename={() =>
                        setRenaming({ type: 'session', id: session.id, current: session.title })
                      }
                    />
                  )
                })
              )
            ) : notesLoading ? (
              <SidebarSkeleton />
            ) : notes.length === 0 ? (
              <p className="text-xs text-center py-8 px-3" style={{ color: 'var(--lp-muted)' }}>
                No notes yet
              </p>
            ) : (
              notes.map((note) => {
                const isActive = pathname.includes(`/notes/${note.id}`)
                return (
                  <SidebarItem
                    key={note.id}
                    label={note.title || 'Untitled'}
                    href={`/workspace/${workspaceId}/notes/${note.id}`}
                    isActive={isActive}
                    icon={<FileText className="h-3.5 w-3.5 shrink-0" />}
                    onDelete={() => deleteNote.mutate(note.id)}
                    onRename={() =>
                      setRenaming({ type: 'note', id: note.id, current: note.title })
                    }
                  />
                )
              })
            )}
          </div>
        </ScrollArea>

      </aside>}

      {/* ─── Main Content ─── */}
      <main className={`${showSidebar ? 'pl-60' : ''} pt-14 min-h-screen`}>
        <div className="px-6 py-5">{children}</div>
      </main>

      {/* Modals */}
      <WorkspaceCreateModal
        open={showCreateWs}
        onOpenChange={setShowCreateWs}
        onCreated={(ws) => router.push(`/workspace/${ws.id}/notes`)}
      />

      {renaming && (
        <RenameDialog
          current={renaming.current}
          onConfirm={async (title) => {
            if (renaming.type === 'note') {
              await updateNote.mutateAsync({ noteId: renaming.id, title })
            } else {
              await renameSession.mutateAsync({ sessionId: renaming.id, title })
            }
            setRenaming(null)
          }}
          onClose={() => setRenaming(null)}
        />
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SidebarItem({
  label,
  href,
  isActive,
  icon,
  onDelete,
  onRename,
}: {
  label: string
  href: string
  isActive: boolean
  icon: React.ReactNode
  onDelete: () => void
  onRename: () => void
}) {
  return (
    <div
      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
      style={
        isActive
          ? { backgroundColor: 'rgba(167,139,250,0.12)', color: 'var(--lp-ink)' }
          : { color: 'var(--lp-body)' }
      }
    >
      {icon}
      <Link href={href} className="flex-1 truncate text-xs lp-display">
        {label}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:opacity-60"
            style={{ color: 'var(--lp-muted)' }}
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onRename}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-state-error focus:text-state-error"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-7 rounded-lg animate-pulse mx-1 my-0.5"
          style={{ backgroundColor: 'var(--lp-border)', opacity: 1 - i * 0.25 }}
        />
      ))}
    </>
  )
}

function RenameDialog({
  current,
  onConfirm,
  onClose,
}: {
  current: string
  onConfirm: (name: string) => Promise<void>
  onClose: () => void
}) {
  const [value, setValue] = useState(current)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setSaving(true)
    await onConfirm(value.trim())
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="lp-glass rounded-2xl p-5 w-full max-w-xs shadow-xl"
        style={{ border: '1px solid var(--lp-border)' }}
      >
        <p className="lp-display text-sm font-semibold mb-3" style={{ color: 'var(--lp-ink)' }}>
          Rename
        </p>
        <input
          className="lp-auth-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-full text-sm lp-display font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ color: 'var(--lp-body)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!value.trim() || saving}
            className="px-4 py-2 rounded-full text-sm lp-display font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
          >
            {saving ? 'Saving…' : 'Rename'}
          </button>
        </div>
      </form>
    </div>
  )
}
