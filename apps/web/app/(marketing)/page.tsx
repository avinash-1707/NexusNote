import Link from 'next/link'
import { FileText, Link2, Brain, Layers, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Layers,
    title: 'Workspaces',
    description:
      'Organize research into isolated contexts. Each workspace is its own knowledge universe — never mixed, always focused.',
  },
  {
    icon: FileText,
    title: 'Notes, PDFs & Links',
    description:
      'Ingest anything. Write rich notes, upload PDFs, scrape web pages — all indexed together into a unified knowledge base.',
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description:
      'Ask questions, get answers grounded strictly in your workspace. No hallucinations from sources outside your data.',
  },
  {
    icon: Zap,
    title: 'Instant Embedding',
    description:
      'One-click vectorization. Watch your content become queryable in real time via server-sent events.',
  },
  {
    icon: Shield,
    title: 'Strict RAG Isolation',
    description:
      'Workspaces never cross-contaminate. Vector retrieval is always scoped — iron-clad at every layer.',
  },
  {
    icon: Link2,
    title: 'Smart Scraping',
    description:
      'Paste a URL and extract structured, clean text automatically. No manual copy-paste ever required.',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-bg-base min-h-screen">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.6,
        }}
      />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-10 rounded border border-border-default bg-bg-surface text-xs text-text-muted font-mono">
            <span
              className="h-1.5 w-1.5 rounded-full bg-state-success inline-block"
              style={{ boxShadow: '0 0 6px var(--state-success)' }}
            />
            RAG-powered knowledge workspace
          </div>

          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-semibold tracking-tight text-text-primary leading-[1.05] mb-6">
            Your research.
            <br />
            Unified.{' '}
            <span className="text-accent-primary">Queryable.</span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
            NexusNote organizes your notes, PDFs, and web links into scoped
            knowledge bases — then lets you query them with a precision AI
            assistant that never hallucinates outside your data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Fade to next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
        />
      </section>

      {/* Features */}
      <section className="relative px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
              Everything in one focused workspace
            </h2>
            <p className="text-sm text-text-muted">
              From ingestion to intelligent query — no context switching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-lg border border-border-default bg-bg-surface hover:bg-bg-surface-raised transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded flex items-center justify-center bg-accent-subtle shrink-0">
                    <feature.icon className="h-4 w-4 text-accent-primary" />
                  </div>
                  <span className="font-medium text-sm text-text-primary">
                    {feature.title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-text-muted">nexusnote</span>
          <span className="text-xs text-text-muted">
            Built for researchers &amp; knowledge workers
          </span>
        </div>
      </footer>
    </div>
  )
}
