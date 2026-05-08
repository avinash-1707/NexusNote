'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StickyNote } from 'lucide-react'
import { useCreateNote, useNotes } from '@/lib/queries'

export default function NotesPage() {
  const params = useParams<{ workspaceId: string }>()
  const workspaceId = Number(params.workspaceId)
  const router = useRouter()

  const { data: notes, isLoading } = useNotes(workspaceId)
  const createNote = useCreateNote(workspaceId)

  useEffect(() => {
    if (isLoading || !notes) return
    if (notes.length > 0) {
      const latest = [...notes].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )[0]
      router.replace(`/workspace/${workspaceId}/notes/${latest.id}`)
    }
  }, [notes, isLoading, workspaceId, router])

  const handleCreate = async () => {
    const note = await createNote.mutateAsync('Untitled')
    router.push(`/workspace/${workspaceId}/notes/${note.id}`)
  }

  if (isLoading || (notes && notes.length > 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="h-4 w-4 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--lp-border)', borderTopColor: 'var(--lp-iris)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid var(--lp-border)' }}
      >
        <StickyNote className="h-5 w-5" style={{ color: 'var(--lp-muted)' }} />
      </div>
      <h2 className="text-base font-semibold lp-display mb-1" style={{ color: 'var(--lp-ink)' }}>
        No notes yet
      </h2>
      <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
        Create your first note to start building your knowledge base.
      </p>
      <button
        onClick={handleCreate}
        disabled={createNote.isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold lp-display disabled:opacity-50 transition-opacity hover:opacity-85"
        style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
      >
        {createNote.isPending ? (
          <>
            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Creating…
          </>
        ) : (
          <>
            <span style={{ color: 'var(--lp-iris)' }}>✦</span>
            Create your first note
          </>
        )}
      </button>
    </div>
  )
}
