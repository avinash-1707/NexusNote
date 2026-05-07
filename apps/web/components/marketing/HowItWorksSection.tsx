'use client'

import { useEffect, useRef } from 'react'
import { Upload, Zap, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: Upload,
    title: 'Add your knowledge',
    description:
      'Write rich notes, upload PDFs, or paste any URL. Everything lands in a single, focused workspace — organized and ready to index.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Vectorize in one click',
    description:
      'Hit "Create Embedding" on any item. Watch live status updates stream back as your content is chunked, embedded, and stored in pgvector.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Query with precision',
    description:
      'Open the AI assistant and ask anything. It retrieves only from your workspace — never hallucinating context outside your collection.',
  },
]

export function HowItWorksSection() {
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
    <section id="how-it-works" className="relative px-6 lg:px-8 py-28">
      {/* Blob */}
      <div
        className="lp-blob-2 absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-coral) 0%, var(--lp-iris) 60%, transparent 75%)',
          opacity: 0.07,
          filter: 'blur(70px)',
        }}
      />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <div className="lp-reveal text-center mb-16">
          <p
            className="lp-display text-xs font-semibold tracking-[0.15em] uppercase mb-4"
            style={{ color: 'var(--lp-cyan)' }}
          >
            ✦ How it works
          </p>
          <h2
            className="lp-display font-bold tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--lp-ink)' }}
          >
            From raw content
            <br />
            to precise answers
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-[52px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, var(--lp-iris), var(--lp-cyan), var(--lp-iris))', opacity: 0.2 }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="lp-reveal relative flex flex-col items-center text-center"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Number + icon circle */}
                <div className="relative mb-6">
                  <div
                    className="h-[104px] w-[104px] rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 35% 32%, var(--lp-surface) 0%, var(--lp-bg-warm) 100%)`,
                      border: '1px solid var(--lp-border)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
                    }}
                  >
                    <Icon className="h-7 w-7" style={{ color: 'var(--lp-iris)' }} />
                  </div>
                  {/* Step number badge */}
                  <div
                    className="lp-display absolute -top-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Eyebrow */}
                <p
                  className="lp-display text-[10px] font-semibold tracking-[0.12em] uppercase mb-3"
                  style={{ color: 'var(--lp-iris)' }}
                >
                  Step {step.number}
                </p>

                <h3
                  className="lp-display font-semibold text-lg mb-3 leading-snug"
                  style={{ color: 'var(--lp-ink)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed max-w-[280px]"
                  style={{ color: 'var(--lp-body)' }}
                >
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
