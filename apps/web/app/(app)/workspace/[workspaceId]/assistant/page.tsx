import { Brain, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AssistantPage({
  params,
}: {
  params: { workspaceId: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-12 w-12 rounded-xl bg-accent-subtle border border-border-default flex items-center justify-center mb-4">
        <Brain className="h-5 w-5 text-accent-primary" />
      </div>
      <h2 className="text-base font-semibold text-text-primary mb-1">AI Assistant</h2>
      <p className="text-sm text-text-muted mb-6 max-w-xs leading-relaxed">
        Ask questions about your workspace content. Every answer is grounded
        strictly in your data — nothing from outside.
      </p>
      <Button size="sm" className="gap-2" asChild>
        <Link href={`/workspace/${params.workspaceId}/assistant/new`}>
          <Plus className="h-4 w-4" />
          New Chat
        </Link>
      </Button>
    </div>
  )
}
