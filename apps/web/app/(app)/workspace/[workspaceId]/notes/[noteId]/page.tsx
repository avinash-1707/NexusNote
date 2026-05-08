'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Bold, Code, Heading1, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateEmbedding, useNote, useUpdateNote } from '@/lib/queries'
import { qk } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'

export default function NotePage() {
  const params = useParams<{ workspaceId: string; noteId: string }>()
  const workspaceId = Number(params.workspaceId)
  const noteId = Number(params.noteId)

  const { data: note } = useNote(workspaceId, noteId)
  const qc = useQueryClient()
  const updateNote = useUpdateNote(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)

  const [title, setTitle] = useState('')
  const [jobId, setJobId] = useState<number | null>(null)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const editorInitialized = useRef(false)

  useEffect(() => {
    if (embedStatus === 'done') {
      qc.invalidateQueries({ queryKey: qk.note(workspaceId, noteId) })
      qc.invalidateQueries({ queryKey: qk.notes(workspaceId) })
    }
  }, [embedStatus, noteId, qc, workspaceId])

  useEffect(() => {
    if (note && !editorInitialized.current) {
      setTitle(note.title ?? '')
    }
  }, [note?.id])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your note…' }),
      Markdown,
    ],
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[calc(100vh-14rem)] text-sm leading-7' },
    },
    onUpdate({ editor }) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()
        updateNote.mutate({ noteId, content_md: md })
      }, 1500)
    },
  })

  useEffect(() => {
    if (!editor || !note || editorInitialized.current) return
    editor.commands.setContent(note.content_md || '', { emitUpdate: false })
    editorInitialized.current = true
  }, [editor, note])

  const handleTitleBlur = () => {
    if (title !== note?.title) {
      updateNote.mutate({ noteId, title })
    }
  }

  const handleEmbed = async () => {
    const res = await createEmbedding.mutateAsync({ resource_type: 'note', resource_id: noteId })
    setJobId(res.job_id)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 5.5rem)' }}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <input
          className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none lp-display placeholder:opacity-30"
          style={{ color: 'var(--lp-ink)' }}
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
        />
        <div className="shrink-0 pt-1">
          {note && (
            <EmbeddingStatus status={embedStatus} isIndexed={note.is_indexed} onEmbed={handleEmbed} />
          )}
        </div>
      </div>

      {/* Toolbar — sticky below navbar */}
      {editor && (
        <div
          className="sticky top-[4.75rem] z-10 flex items-center gap-0.5 p-1 mb-6 rounded-xl w-fit lp-glass"
          style={{ border: '1px solid var(--lp-border)' }}
        >
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            label="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 mx-0.5" style={{ backgroundColor: 'var(--lp-border)' }} />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="Ordered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            label="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            label="Inline code"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>
      )}

      {/* Editor — fills remaining height, no card border */}
      <div className="flex-1 pb-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarBtn({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors"
      style={
        active
          ? { color: 'var(--lp-iris)', backgroundColor: 'rgba(167,139,250,0.15)' }
          : { color: 'var(--lp-muted)' }
      }
    >
      {children}
    </button>
  )
}
