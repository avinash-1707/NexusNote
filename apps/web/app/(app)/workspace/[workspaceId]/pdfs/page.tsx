'use client'

import { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Eye, FileText, Trash2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateEmbedding, useDeletePDF, usePDFs, useUploadPDF } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'
import type { PDF } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function PDFsPage() {
  const params = useParams<{ workspaceId: string }>()
  const workspaceId = Number(params.workspaceId)

  const { data: pdfs = [], isLoading } = usePDFs(workspaceId)
  const uploadPDF = useUploadPDF(workspaceId)

  const [isDragging, setIsDragging] = useState(false)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') return
    uploadPDF.mutate(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="max-w-4xl">
      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors mb-8',
          uploadPDF.isPending
            ? 'border-accent-primary bg-accent-subtle cursor-wait'
            : isDragging
              ? 'border-accent-primary bg-accent-subtle'
              : 'border-border-default hover:border-accent-primary hover:bg-bg-surface',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <Upload className={cn('h-5 w-5 mb-2 transition-colors', isDragging || uploadPDF.isPending ? 'text-accent-primary' : 'text-text-muted')} />
        <p className={cn('text-sm font-medium transition-colors', isDragging || uploadPDF.isPending ? 'text-accent-primary' : 'text-text-secondary')}>
          {uploadPDF.isPending ? 'Uploading…' : 'Drop PDF here or click to upload'}
        </p>
        <p className="text-xs text-text-muted mt-1">PDF files only</p>
      </div>

      {/* PDF list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg border border-border-default bg-bg-surface animate-pulse" />
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-xl bg-bg-surface-raised border border-border-default flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No PDFs uploaded yet</h3>
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Upload a PDF above to extract and index its content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfs.map((pdf) => (
            <PDFCard
              key={pdf.id}
              pdf={pdf}
              workspaceId={workspaceId}
              onView={() => setViewUrl(pdf.cloudinary_url)}
            />
          ))}
        </div>
      )}

      {/* PDF viewer modal */}
      <Dialog open={!!viewUrl} onOpenChange={(open) => !open && setViewUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
            <DialogTitle className="text-sm font-medium text-text-primary">PDF Viewer</DialogTitle>
          </DialogHeader>
          {viewUrl && (
            <iframe
              src={viewUrl}
              className="flex-1 w-full rounded-b-xl"
              title="PDF viewer"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PDFCard({
  pdf,
  workspaceId,
  onView,
}: {
  pdf: PDF
  workspaceId: number
  onView: () => void
}) {
  const [jobId, setJobId] = useState<number | null>(null)
  const deletePDF = useDeletePDF(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  const handleEmbed = async () => {
    const res = await createEmbedding.mutateAsync({ resource_type: 'pdf', resource_id: pdf.id })
    setJobId(res.job_id)
  }

  return (
    <div className="p-4 rounded-lg border border-border-default bg-bg-surface hover:bg-bg-surface-raised transition-colors group flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded bg-bg-surface-raised border border-border-subtle flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-text-muted" />
        </div>
        <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2 flex-1">
          {pdf.title}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto">
        <EmbeddingStatus status={embedStatus} onEmbed={handleEmbed} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon-sm" variant="ghost" onClick={onView} title="View PDF">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-state-error hover:text-state-error"
            onClick={() => deletePDF.mutate(pdf.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
