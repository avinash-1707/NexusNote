'use client'

import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmbeddingStatusType = 'idle' | 'pending' | 'processing' | 'done' | 'error'

interface EmbeddingStatusProps {
  status: EmbeddingStatusType
  onEmbed: () => void
}

export function EmbeddingStatus({ status, onEmbed }: EmbeddingStatusProps) {
  if (status === 'pending' || status === 'processing') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
        <span className="text-sm text-text-muted font-mono">Indexing…</span>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-state-success" />
        <span className="text-sm text-state-success font-mono">Indexed</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-state-error" />
        <Button size="sm" variant="destructive" onClick={onEmbed}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" onClick={onEmbed}>
      Create Embedding
    </Button>
  )
}
