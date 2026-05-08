'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Link2, Trash2 } from 'lucide-react'
import { qk, useCreateEmbedding, useDeleteLink, useLinks, useSaveLink } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import type { Link as LinkType } from '@/lib/types'

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
    <div className="max-w-3xl mx-auto">
      {/* URL input */}
      <div className="flex gap-2 mb-2">
        <input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="lp-auth-input flex-1"
        />
        <button
          onClick={handleSave}
          disabled={!url.trim() || saveLink.isPending}
          className="px-5 py-2.5 rounded-full text-sm font-semibold lp-display transition-opacity hover:opacity-85 disabled:opacity-50 shrink-0"
          style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
        >
          {saveLink.isPending ? 'Saving…' : 'Save Link'}
        </button>
      </div>
      {urlError && (
        <p className="text-xs mb-6" style={{ color: 'var(--lp-coral)' }}>{urlError}</p>
      )}

      {/* Links list */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl animate-pulse"
                style={{ backgroundColor: 'var(--lp-border)', opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid var(--lp-border)' }}
            >
              <Link2 className="h-5 w-5" style={{ color: 'var(--lp-muted)' }} />
            </div>
            <h3 className="text-base font-semibold lp-display mb-1" style={{ color: 'var(--lp-ink)' }}>
              No links saved yet
            </h3>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
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
  const router = useRouter()
  const qc = useQueryClient()
  const [jobId, setJobId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteLink = useDeleteLink(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  useEffect(() => {
    if (embedStatus === 'done') {
      qc.invalidateQueries({ queryKey: qk.links(workspaceId) })
    }
  }, [embedStatus, qc, workspaceId])

  const handleEmbed = async () => {
    const res = await createEmbedding.mutateAsync({ resource_type: 'link', resource_id: link.id })
    setJobId(res.job_id)
  }

  return (
    <>
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-2xl lp-glass transition-all hover:brightness-110 group"
        style={{ border: '1px solid var(--lp-border)' }}
      >
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid var(--lp-border)' }}
        >
          <Link2 className="h-3.5 w-3.5" style={{ color: 'var(--lp-muted)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium lp-display truncate" style={{ color: 'var(--lp-ink)' }}>
            {link.title || 'Untitled'}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--lp-muted)' }}>{link.url}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <EmbeddingStatus status={embedStatus} isIndexed={link.is_indexed} onEmbed={handleEmbed} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open link"
              className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--lp-body)' }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setConfirmOpen(true)}
              title="Delete"
              className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--state-error)' }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Link"
        description="This link and its indexed content will be permanently deleted. This cannot be undone."
        onConfirm={async () => {
          await deleteLink.mutateAsync(link.id)
          setConfirmOpen(false)
          router.refresh()
        }}
        isPending={deleteLink.isPending}
      />
    </>
  )
}
