'use client'

import { useEffect, useRef } from 'react'
import { Layers, Brain, Zap, FileText, Shield, Link2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Badge {
  label: string
  variant: 'pink' | 'orange' | 'blue'
}

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  badge: Badge
  gridClass: string
  glass?: boolean
  preview?: React.ReactNode
}

function ChatPreview() {
  return (
    <div
      className="mt-5 rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: 'rgba(13,61,58,0.35)', border: '1px solid rgba(232,221,208,0.08)' }}
    >
      {[
        { role: 'user', text: 'Summarise the key themes in my research?' },
        { role: 'ai', text: 'Based on your 3 notes and 2 PDFs, I found 4 main themes: distributed systems, consistency models, CAP theorem, and consensus algorithms.' },
      ].map((msg, i) => (
        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
          {msg.role === 'ai' && (
            <div
              className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold lp-display"
              style={{ backgroundColor: 'var(--lp-iris)', color: '#1e0a3c' }}
            >
              N
            </div>
          )}
          <div
            className="text-[11px] leading-relaxed rounded-xl px-3 py-2 max-w-[88%]"
            style={
              msg.role === 'user'
                ? { backgroundColor: 'var(--lp-iris)', color: '#1e0a3c', opacity: 0.85 }
                : { backgroundColor: 'rgba(232,221,208,0.08)', color: 'var(--lp-body)' }
            }
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--lp-iris)', opacity: 0.5 + i * 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}

function IsolationPreview() {
  return (
    <div
      className="mt-5 rounded-xl px-4 py-3 font-mono text-[11px] leading-6"
      style={{ backgroundColor: 'rgba(13,61,58,0.45)', border: '1px solid rgba(232,221,208,0.08)', color: 'var(--lp-body)' }}
    >
      <span style={{ color: 'var(--lp-muted)' }}>{'-- RAG query'}</span>
      <br />
      <span style={{ color: 'var(--lp-cyan)' }}>WHERE</span>{' '}
      <span style={{ color: 'var(--lp-iris)' }}>workspace_id</span>{' = '}
      <span style={{ color: 'var(--lp-coral)' }}>:current_ws</span>
      <br />
      <span style={{ color: 'var(--lp-muted)' }}>{'-- cross-ws leakage: '}</span>
      <span style={{ color: '#48bb78', fontWeight: 600 }}>0</span>
    </div>
  )
}

const badgeStyles: Record<Badge['variant'], React.CSSProperties> = {
  pink: {
    backgroundColor: 'rgba(251,207,232,0.15)',
    color: '#F9A8D4',
    border: '1px solid rgba(249,168,212,0.2)',
  },
  orange: {
    backgroundColor: 'rgba(253,186,116,0.12)',
    color: '#FED7AA',
    border: '1px solid rgba(253,186,116,0.2)',
  },
  blue: {
    backgroundColor: 'rgba(147,197,253,0.12)',
    color: '#93C5FD',
    border: '1px solid rgba(147,197,253,0.2)',
  },
}

const features: Feature[] = [
  {
    icon: Layers,
    title: 'Isolated Knowledge Universes',
    description:
      'Create up to 5 workspaces, each a fully self-contained knowledge base. Your research streams never bleed together — total contextual isolation at every layer.',
    badge: { label: 'ORGANIZE', variant: 'blue' },
    gridClass: 'bento-wide row-span-1',
  },
  {
    icon: Brain,
    title: 'Precision AI Assistant',
    description:
      'Ask anything. Get answers grounded strictly in your workspace data — never hallucinated, never bleeding from another context.',
    badge: { label: 'AI', variant: 'orange' },
    gridClass: 'bento-right-tall',
    glass: true,
    preview: <ChatPreview />,
  },
  {
    icon: Zap,
    title: 'One-Click Vectorization',
    description: 'Hit "Create Embedding" and watch live status via SSE as content becomes queryable in real time.',
    badge: { label: 'LIVE', variant: 'pink' },
    gridClass: 'bento-mid-left',
  },
  {
    icon: FileText,
    title: 'Notes, PDFs & Links',
    description: 'Write notes, upload PDFs, paste URLs — all unified into one searchable knowledge base per workspace.',
    badge: { label: 'INGEST', variant: 'blue' },
    gridClass: 'bento-mid-right',
  },
  {
    icon: Shield,
    title: 'Iron-Clad RAG Isolation',
    description:
      'Vector retrieval is always scoped by workspace at every layer. Cross-workspace contamination is architecturally impossible — enforced in SQL, not just policy.',
    badge: { label: 'SECURE', variant: 'orange' },
    gridClass: 'bento-wide-bot',
    preview: <IsolationPreview />,
  },
  {
    icon: Link2,
    title: 'Smart URL Scraping',
    description: 'Paste any URL. We extract clean, structured text automatically — no copy-paste, no noise.',
    badge: { label: 'AUTO', variant: 'pink' },
    gridClass: 'bento-right-end',
  },
]

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    container.querySelectorAll('.lp-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="relative px-6 lg:px-8 py-28 overflow-hidden">
      {/* Section blob */}
      <div
        className="lp-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-cyan) 0%, var(--lp-iris) 50%, transparent 70%)',
          opacity: 0.06,
          filter: 'blur(80px)',
        }}
      />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <div className="lp-reveal text-center mb-14">
          <p
            className="lp-display text-xs font-semibold tracking-[0.15em] uppercase mb-4"
            style={{ color: 'var(--lp-iris)' }}
          >
            ✦ Features
          </p>
          <h2
            className="lp-display font-bold tracking-[-0.03em] leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--lp-ink)' }}
          >
            Everything in one
            <br />
            focused workspace
          </h2>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: 'var(--lp-body)' }}>
            From ingestion to intelligent query — no context switching, no hallucinations outside your data.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:grid-rows-[auto_auto_auto]">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`lp-reveal lp-display group rounded-[24px] p-6 flex flex-col cursor-default
                  transition-all duration-300 hover:-translate-y-1
                  ${feature.gridClass}
                  ${feature.glass ? 'lp-glass' : ''}
                `}
                style={{
                  transitionDelay: `${i * 60}ms`,
                  backgroundColor: feature.glass ? undefined : 'var(--lp-surface)',
                  border: feature.glass
                    ? '1px solid rgba(167,139,250,0.2)'
                    : '1px solid var(--lp-border)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.boxShadow = feature.glass
                    ? '0 8px 40px rgba(167,139,250,0.18), 0 4px 24px rgba(0,0,0,0.18)'
                    : '0 8px 40px rgba(0,0,0,0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)'
                }}
              >
                {/* Badge + icon row */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="lp-display text-[10px] font-semibold tracking-[0.12em] px-2.5 py-1 rounded-full"
                    style={badgeStyles[feature.badge.variant]}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'
                      ;(e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                      ;(e.currentTarget as HTMLElement).style.filter = ''
                    }}
                  >
                    {feature.badge.label}
                  </span>
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(167,139,250,0.12)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--lp-iris)' }} />
                  </div>
                </div>

                {/* Text */}
                <h3
                  className="font-semibold text-base mb-2 leading-snug"
                  style={{ color: 'var(--lp-ink)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                  {feature.description}
                </p>

                {/* Optional preview */}
                {feature.preview}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
