import { StickyNote, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-12 w-12 rounded-xl bg-bg-surface-raised border border-border-default flex items-center justify-center mb-4">
        <StickyNote className="h-5 w-5 text-text-muted" />
      </div>
      <h2 className="text-base font-semibold text-text-primary mb-1">No notes yet</h2>
      <p className="text-sm text-text-muted mb-6 max-w-xs leading-relaxed">
        Create your first note to start building your knowledge base.
      </p>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Create your first note
      </Button>
    </div>
  )
}
