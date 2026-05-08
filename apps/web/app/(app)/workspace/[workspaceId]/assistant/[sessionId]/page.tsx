'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Send, Brain } from 'lucide-react'
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
      <div
        className="flex items-center gap-3 px-6 py-3 shrink-0 lp-glass"
        style={{ borderBottom: '1px solid var(--lp-border)' }}
      >
        <Brain className="h-4 w-4 shrink-0" style={{ color: 'var(--lp-iris)' }} />
        <span className="text-sm font-semibold lp-display" style={{ color: 'var(--lp-ink)' }}>
          AI Assistant
        </span>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.2)',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full inline-block"
            style={{ backgroundColor: 'var(--lp-iris)' }}
          />
          <span className="text-xs font-mono" style={{ color: 'var(--lp-iris)' }}>
            {workspaceName}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-4 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div
                className="h-4 w-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--lp-border)', borderTopColor: 'var(--lp-iris)' }}
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm" style={{ color: 'var(--lp-muted)' }}>
                Ask anything about your workspace content.
              </p>
              <p className="text-xs" style={{ color: 'var(--lp-muted)' }}>
                Press{' '}
                <kbd
                  className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                  style={{ border: '1px solid var(--lp-border)', color: 'var(--lp-body)' }}
                >
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
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap lp-display',
                  msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm lp-glass',
                )}
                style={
                  msg.role === 'user'
                    ? { backgroundColor: 'var(--lp-iris)', color: 'var(--lp-bg)' }
                    : { border: '1px solid var(--lp-border)', color: 'var(--lp-ink)' }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-sm px-4 py-3 lp-glass"
                style={{ border: '1px solid var(--lp-border)' }}
              >
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: 'var(--lp-iris)', animationDelay: `${i * 160}ms` }}
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
      <div
        className="px-6 py-4 shrink-0 lp-glass"
        style={{ borderTop: '1px solid var(--lp-border)' }}
      >
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm min-h-[42px] max-h-32 overflow-y-auto outline-none lp-display"
            style={{
              backgroundColor: 'rgba(167,139,250,0.06)',
              border: '1px solid var(--lp-border)',
              color: 'var(--lp-ink)',
            }}
            placeholder="Ask about your workspace…"
            rows={1}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(167,139,250,0.45)'
              e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--lp-border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={sendMessage.isPending}
            className="h-[42px] w-[42px] flex items-center justify-center rounded-full shrink-0 transition-opacity hover:opacity-80 disabled:opacity-50 lp-glow-btn"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
