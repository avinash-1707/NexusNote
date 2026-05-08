'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Bold, Code, Heading1, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateEmbedding, useNote, useUpdateNote } from '@/lib/queries'
import { useEmbeddingStatus } from '@/hooks/useEmbeddingStatus'
import { EmbeddingStatus } from '@/components/EmbeddingStatus'

export default function NotePage() {
  const params = useParams<{ workspaceId: string; noteId: string }>()
  const workspaceId = Number(params.workspaceId)
  const noteId = Number(params.noteId)

  const { data: note } = useNote(workspaceId, noteId)
  const updateNote = useUpdateNote(workspaceId)
  const createEmbedding = useCreateEmbedding(workspaceId)

  const [title, setTitle] = useState('')
  const [jobId, setJobId] = useState<number | null>(null)
  const embedStatus = useEmbeddingStatus(workspaceId, jobId)

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const editorInitialized = useRef(false)

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
      attributes: { class: 'focus:outline-none min-h-[60vh] text-sm leading-7' },
    },
    onUpdate({ editor }) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()
        updateNote.mutate({ noteId, content_md: md })
      }, 1500)
    },
  })

  // Set initial content once after note + editor both ready
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
    <div className="max-w-3xl mx-auto">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <input
          className="flex-1 text-2xl font-semibold text-text-primary bg-transparent border-none outline-none placeholder:text-text-muted"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
        />
        <div className="shrink-0 pt-1">
          <EmbeddingStatus status={embedStatus} onEmbed={handleEmbed} />
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex items-center gap-0.5 p-1 mb-4 rounded border border-border-default bg-bg-surface w-fit">
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
          <div className="w-px h-4 bg-border-default mx-0.5" />
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

      {/* Editor area */}
      <div className="min-h-[65vh] p-4 rounded-lg border border-border-subtle bg-bg-surface focus-within:border-border-default transition-colors">
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
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded transition-colors',
        active
          ? 'bg-accent-subtle text-accent-primary'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-surface-raised',
      )}
    >
      {children}
    </button>
  )
}
