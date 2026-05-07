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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
    <div className="min-h-screen bg-bg-base">
      {/* ─── Top Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b border-border-default bg-bg-base">
        {/* Left: logo + workspace switcher — 240px to align with sidebar */}
        <div className="flex items-center gap-2 px-4 shrink-0 w-60 border-r border-border-default h-full">
          <Link
            href="/"
            className="font-mono text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors"
          >
            nn
          </Link>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 font-medium text-text-primary max-w-[140px] truncate px-2"
              >
                <span className="truncate text-sm">
                  {currentWorkspace?.name ?? '…'}
                </span>
                <ChevronDown className="h-3 w-3 text-text-muted shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  className={cn(ws.id === workspaceId && 'text-accent-primary font-medium')}
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
        <nav className="flex-1 flex items-center justify-center gap-0.5 px-4">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors',
                  isActive
                    ? 'bg-bg-surface-raised text-text-primary font-medium'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface',
                )}
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
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                'transition-colors',
                isAssistant
                  ? 'bg-accent-subtle text-accent-primary hover:bg-accent-subtle'
                  : 'text-text-muted hover:text-text-secondary',
              )}
              aria-label="AI Assistant"
            >
              <Brain className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] font-medium">U</AvatarFallback>
                </Avatar>
              </Button>
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
      <aside className="fixed left-0 top-14 bottom-0 w-60 border-r border-border-default bg-bg-base flex flex-col z-40">
        <div className="p-3 shrink-0">
          {isAssistant ? (
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleNewSession}
              disabled={createSession.isPending}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-2 text-text-secondary hover:text-text-primary border border-border-default"
              onClick={handleNewNote}
              disabled={createNote.isPending}
            >
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          )}
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {isAssistant ? (
              sessionsLoading ? (
                <SidebarSkeleton />
              ) : sessions.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-8 px-3">
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
              <p className="text-xs text-text-muted text-center py-8 px-3">
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

        <Separator />
        <div className="p-3 shrink-0">
          <p className="text-xs text-text-muted font-mono truncate">
            {currentWorkspace?.name ?? '…'}
          </p>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="pl-60 pt-14 min-h-screen">
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
      className={cn(
        'group flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer transition-colors',
        isActive
          ? 'bg-accent-subtle text-text-primary'
          : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary',
      )}
    >
      {icon}
      <Link href={href} className="flex-1 truncate text-xs">
        {label}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-opacity p-0.5 rounded"
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
          className="h-7 rounded bg-bg-surface animate-pulse mx-1 my-0.5"
          style={{ opacity: 1 - i * 0.2 }}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border-default rounded-xl p-5 w-full max-w-xs shadow-xl"
      >
        <p className="text-sm font-medium text-text-primary mb-3">Rename</p>
        <input
          className="w-full h-9 rounded-md border border-border-default bg-bg-base px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" disabled={!value.trim() || saving}>
            {saving ? 'Saving…' : 'Rename'}
          </Button>
        </div>
      </form>
    </div>
  )
}
