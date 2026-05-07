'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ExternalLink, Link2, Trash2 } from 'lucide-react'
import { useCreateEmbedding, useDeleteLink, useLinks, useSaveLink } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'
import type { Link as LinkType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LinksPage() {
  const params = useParams<{ workspaceId: string }>()
  const workspaceId = Number(params.workspaceId)

  const { data: links = [], isLoading } = useLinks(workspaceId)
  const saveLink = useSaveLink(workspaceId)

  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const handleSave = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setUrlError('')
    try {
      await saveLink.mutateAsync(trimmed)
      setUrl('')
    } catch {
      setUrlError('Failed to save link. Check the URL and try again.')
    }
  }

  return (
    <div className="max-w-3xl">
      {/* URL input */}
      <div className="flex gap-2 mb-2">
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1"
        />
        <Button onClick={handleSave} disabled={!url.trim() || saveLink.isPending}>
          {saveLink.isPending ? 'Saving…' : 'Save Link'}
        </Button>
      </div>
      {urlError && <p className="text-xs text-state-error mb-6">{urlError}</p>}

      {/* Links list */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg border border-border-default bg-bg-surface animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-xl bg-bg-surface-raised border border-border-default flex items-center justify-center mb-4">
              <Link2 className="h-5 w-5 text-text-muted" />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">No links saved yet</h3>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed">
              Paste a URL above to scrape and index its content.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <LinkItem key={link.id} link={link} workspaceId={workspaceId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinkItem({ link, workspaceId }: { link: LinkType; workspaceId: number }) {
  const [jobId, setJobId] = useState<number | null>(null)
  const deleteLink = useDeleteLink(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  const handleEmbed = async () => {
    const res = await createEmbedding.mutateAsync({ resource_type: 'link', resource_id: link.id })
    setJobId(res.job_id)
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border-default bg-bg-surface hover:bg-bg-surface-raised transition-colors group">
      <div className="h-8 w-8 rounded bg-bg-surface-raised border border-border-subtle flex items-center justify-center shrink-0">
        <Link2 className="h-3.5 w-3.5 text-text-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {link.title || 'Untitled'}
        </p>
        <p className="text-xs text-text-muted truncate mt-0.5">{link.url}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <EmbeddingStatus status={embedStatus} onEmbed={handleEmbed} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon-sm" variant="ghost" asChild title="Open link">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-state-error hover:text-state-error"
            onClick={() => deleteLink.mutate(link.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
