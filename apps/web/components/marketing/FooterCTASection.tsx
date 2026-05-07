import Link from 'next/link'

export function FooterCTASection() {
  return (
    <section
      className="relative overflow-hidden px-6 lg:px-8 py-32 text-center"
      style={{ backgroundColor: 'var(--lp-footer-bg)' }}
    >
      {/* Mesh blobs */}
      <div
        className="lp-blob absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, var(--lp-iris) 0%, var(--lp-cyan) 50%, transparent 72%)',
          opacity: 0.1,
          filter: 'blur(72px)',
        }}
      />
      <div
        className="lp-blob-2 absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-coral) 0%, transparent 70%)',
          opacity: 0.08,
          filter: 'blur(64px)',
        }}
      />

      {/* Oversized 'N' watermark */}
      <div
        className="lp-display absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ fontSize: 'clamp(14rem, 28vw, 28rem)', fontWeight: 800, color: '#E8DDD0', opacity: 0.035, lineHeight: 1 }}
        aria-hidden="true"
      >
        N
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <p
          className="lp-display text-xs font-semibold tracking-[0.15em] uppercase mb-5"
          style={{ color: 'var(--lp-iris)' }}
        >
          ✦ Get started today
        </p>

        <h2
          className="lp-display font-bold tracking-[-0.035em] leading-[1.04] mb-6"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#E8DDD0' }}
        >
          Start building your
          <br />
          knowledge base today.
        </h2>

        <p
          className="text-base leading-relaxed mb-10 max-w-md mx-auto"
          style={{ color: '#B5A99A' }}
        >
          Free to start. No credit card required. Five full workspaces, unlimited notes, and a precision AI assistant — all yours.
        </p>

        {/* CTA cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="lp-display inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:scale-[1.04] hover:brightness-105 active:scale-[0.97]"
            style={{
              backgroundColor: '#E8DDD0',
              color: '#071A18',
              boxShadow: '0 0 32px rgba(167,139,250,0.35), 0 0 64px rgba(34,211,238,0.18)',
            }}
          >
            <span style={{ color: '#A78BFA' }}>✦</span>
            Create your first workspace
          </Link>
          <Link
            href="/login"
            className="lp-display inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium transition-all hover:opacity-70"
            style={{ color: '#B5A99A', border: '1px solid rgba(232,221,208,0.12)' }}
          >
            Already have an account? Sign in
          </Link>
        </div>

        {/* Sparkle row */}
        <div className="mt-12 flex items-center justify-center gap-8" style={{ color: '#7A6F63' }}>
          {['Workspace isolation', 'RAG-scoped AI', 'Live embeddings'].map((item) => (
            <span key={item} className="lp-display text-xs flex items-center gap-1.5">
              <span style={{ color: '#A78BFA' }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
