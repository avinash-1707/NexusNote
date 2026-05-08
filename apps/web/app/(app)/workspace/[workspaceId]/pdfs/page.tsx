'use client'

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, FileText, Trash2, Upload } from 'lucide-react'
import { useCreateEmbedding, useDeletePDF, usePDFs, useUploadPDF } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'
import type { PDF } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'

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

  const isActive = isDragging || uploadPDF.isPending

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload zone */}
      <div
        onClick={() => !uploadPDF.isPending && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all mb-8"
        style={{
          borderColor: isActive ? 'var(--lp-iris)' : 'var(--lp-border)',
          backgroundColor: isActive ? 'rgba(167,139,250,0.08)' : 'transparent',
          cursor: uploadPDF.isPending ? 'wait' : 'pointer',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <Upload
          className="h-5 w-5 mb-2 transition-colors"
          style={{ color: isActive ? 'var(--lp-iris)' : 'var(--lp-muted)' }}
        />
        <p
          className="text-sm font-medium lp-display transition-colors"
          style={{ color: isActive ? 'var(--lp-iris)' : 'var(--lp-body)' }}
        >
          {uploadPDF.isPending ? 'Uploading…' : 'Drop PDF here or click to upload'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--lp-muted)' }}>PDF files only</p>
      </div>

      {/* PDF list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--lp-border)', opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid var(--lp-border)' }}
          >
            <FileText className="h-5 w-5" style={{ color: 'var(--lp-muted)' }} />
          </div>
          <h3 className="text-base font-semibold lp-display mb-1" style={{ color: 'var(--lp-ink)' }}>
            No PDFs uploaded yet
          </h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
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
            <DialogTitle
              className="text-sm font-medium lp-display"
              style={{ color: 'var(--lp-ink)' }}
            >
              PDF Viewer
            </DialogTitle>
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
  const router = useRouter()
  const [jobId, setJobId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deletePDF = useDeletePDF(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  const handleEmbed = async () => {
    const res = await createEmbedding.mutateAsync({ resource_type: 'pdf', resource_id: pdf.id })
    setJobId(res.job_id)
  }

  return (
    <>
      <div
        className="p-4 rounded-2xl lp-glass group flex flex-col gap-3 transition-all hover:brightness-110"
        style={{ border: '1px solid var(--lp-border)' }}
      >
        <div className="flex items-start gap-2">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid var(--lp-border)' }}
          >
            <FileText className="h-4 w-4" style={{ color: 'var(--lp-muted)' }} />
          </div>
          <p className="text-sm font-medium lp-display leading-snug line-clamp-2 flex-1" style={{ color: 'var(--lp-ink)' }}>
            {pdf.title}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <EmbeddingStatus status={embedStatus} onEmbed={handleEmbed} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onView}
              title="View PDF"
              className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--lp-body)' }}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
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
        title="Delete PDF"
        description="This PDF and its indexed content will be permanently deleted. This cannot be undone."
        onConfirm={async () => {
          await deletePDF.mutateAsync(pdf.id)
          setConfirmOpen(false)
          router.refresh()
        }}
        isPending={deletePDF.isPending}
      />
    </>
  )
}
