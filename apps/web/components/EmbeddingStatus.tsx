'use client'

import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

type EmbeddingStatusType = 'idle' | 'pending' | 'processing' | 'done' | 'error'

interface EmbeddingStatusProps {
  status: EmbeddingStatusType
  isIndexed: boolean
  onEmbed: () => void
}

export function EmbeddingStatus({ status, isIndexed, onEmbed }: EmbeddingStatusProps) {
  if (status === 'pending' || status === 'processing') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--lp-muted)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--lp-muted)' }}>Indexing…</span>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--state-success)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--state-success)' }}>Indexed</span>
      </div>
    )
  }

  if (isIndexed) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--state-success)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--state-success)' }}>Indexed</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" style={{ color: 'var(--state-error)' }} />
        <button
          onClick={onEmbed}
          className="px-3 py-1 rounded-full text-xs font-semibold lp-display transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--state-error)', color: '#fff' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onEmbed}
      className="px-3 py-1.5 rounded-full text-xs font-semibold lp-display transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: 'rgba(167,139,250,0.15)', color: 'var(--lp-iris)', border: '1px solid rgba(167,139,250,0.25)' }}
    >
      Create Embedding
    </button>
  )
}
