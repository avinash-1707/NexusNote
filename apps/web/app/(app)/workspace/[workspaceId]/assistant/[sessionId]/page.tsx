'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Send, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useChatMessages, useSendMessage, useWorkspaces } from '@/lib/queries'

export default function ChatSessionPage() {
  const params = useParams<{ workspaceId: string; sessionId: string }>()
  const workspaceId = Number(params.workspaceId)
  const sessionId = Number(params.sessionId)

  const { data: messages = [], isLoading } = useChatMessages(workspaceId, sessionId)
  const sendMessage = useSendMessage(workspaceId, sessionId)
  const { data: workspaces = [] } = useWorkspaces()
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? '…'

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMessage.isPending])

  const handleSend = () => {
    const content = textareaRef.current?.value.trim()
    if (!content || sendMessage.isPending) return
    textareaRef.current!.value = ''
    textareaRef.current!.style.height = 'auto'
    sendMessage.mutate(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', margin: '-20px -24px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border-default shrink-0 bg-bg-base">
        <Brain className="h-4 w-4 text-accent-primary shrink-0" />
        <span className="text-sm font-medium text-text-primary">AI Assistant</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-subtle bg-bg-surface">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-primary inline-block" />
          <span className="text-xs font-mono text-text-muted">
            Searching: {workspaceName}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-4 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 rounded-full border-2 border-border-default border-t-accent-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-text-muted">
                Ask anything about your workspace content.
              </p>
              <p className="text-xs text-text-muted mt-1">
                Press{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-border-default font-mono text-[10px] bg-bg-surface">
                  Enter
                </kbd>{' '}
                to send
              </p>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-accent-primary text-white rounded-br-sm'
                    : 'bg-bg-surface border border-border-default text-text-primary rounded-bl-sm',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="bg-bg-surface border border-border-default rounded-lg rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-text-muted animate-pulse"
                      style={{ animationDelay: `${i * 160}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="px-6 py-4 border-t border-border-default shrink-0 bg-bg-base">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            className={cn(
              'flex-1 resize-none rounded-md border border-border-default bg-bg-surface',
              'px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-1 focus:ring-accent-primary',
              'min-h-[40px] max-h-32 overflow-y-auto',
            )}
            placeholder="Ask about your workspace…"
            rows={1}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sendMessage.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
