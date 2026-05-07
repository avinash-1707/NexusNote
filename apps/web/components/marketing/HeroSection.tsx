'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function KnowledgeOrb() {
  return (
    <svg
      viewBox="0 0 340 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[440px] mx-auto"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="orb-main" cx="38%" cy="33%">
          <stop offset="0%" stopColor="#1a6660" />
          <stop offset="55%" stopColor="#0D3D3A" />
          <stop offset="100%" stopColor="#071A18" />
        </radialGradient>
        <radialGradient id="orb-glow-r" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#C4B5FD" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="card-sand" cx="22%" cy="20%">
          <stop offset="0%" stopColor="#F5EFE6" />
          <stop offset="100%" stopColor="#C8BBAA" />
        </radialGradient>
        <radialGradient id="card-iris" cx="22%" cy="20%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
        <filter id="clay" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="7" stdDeviation="9" floodColor="#071A18" floodOpacity="0.32" />
        </filter>
        <filter id="soft" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#071A18" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Ambient glow behind orb */}
      <circle cx="170" cy="150" r="115" fill="url(#orb-glow-r)" />

      {/* Main clay orb */}
      <circle cx="170" cy="150" r="78" fill="url(#orb-main)" filter="url(#clay)" />
      {/* Specular highlight */}
      <ellipse cx="147" cy="122" rx="28" ry="19" fill="rgba(255,255,255,0.09)" transform="rotate(-18 147 122)" />
      {/* Rim light */}
      <circle cx="170" cy="150" r="78" stroke="rgba(103,232,249,0.16)" strokeWidth="1.5" fill="none" />
      {/* Inner rings — depth cue */}
      <circle cx="170" cy="150" r="56" stroke="rgba(103,232,249,0.07)" strokeWidth="1" fill="none" />
      <circle cx="170" cy="150" r="33" stroke="rgba(196,181,253,0.09)" strokeWidth="1" fill="none" />
      {/* Core pulse */}
      <circle cx="170" cy="150" r="11" fill="rgba(103,232,249,0.22)" />
      <circle cx="170" cy="150" r="5"  fill="rgba(103,232,249,0.55)" />

      {/* Floating doc card — top right */}
      <rect x="224" y="50" width="80" height="62" rx="13" fill="url(#card-sand)" filter="url(#clay)" />
      <rect x="234" y="63" width="48" height="4" rx="2" fill="#0D3D3A" opacity="0.42" />
      <rect x="234" y="73" width="36" height="4" rx="2" fill="#0D3D3A" opacity="0.28" />
      <rect x="234" y="83" width="42" height="4" rx="2" fill="#0D3D3A" opacity="0.28" />
      <rect x="234" y="93" width="30" height="4" rx="2" fill="#0D3D3A" opacity="0.22" />

      {/* Floating doc card — bottom left */}
      <rect x="36" y="190" width="80" height="62" rx="13" fill="url(#card-iris)" filter="url(#clay)" />
      <rect x="46" y="203" width="48" height="4" rx="2" fill="#3730A3" opacity="0.42" />
      <rect x="46" y="213" width="36" height="4" rx="2" fill="#3730A3" opacity="0.28" />
      <rect x="46" y="223" width="42" height="4" rx="2" fill="#3730A3" opacity="0.28" />
      <rect x="46" y="233" width="30" height="4" rx="2" fill="#3730A3" opacity="0.22" />

      {/* AI badge pill — top left */}
      <rect x="46" y="68" width="64" height="32" rx="16" fill="#67E8F9" opacity="0.86" filter="url(#soft)" />
      <text x="60" y="89" fontSize="13" fontFamily="system-ui,sans-serif" fontWeight="700" fill="#0C4A6E">AI ✦</text>

      {/* Orbital nodes */}
      <circle cx="255" cy="160" r="12" fill="#FCA5A5" filter="url(#soft)" />
      <circle cx="250" cy="155" r="4.5" fill="rgba(255,255,255,0.36)" />

      <circle cx="118" cy="58"  r="9"  fill="#67E8F9" filter="url(#soft)" />
      <circle cx="115" cy="55"  r="3.5" fill="rgba(255,255,255,0.42)" />

      <circle cx="218" cy="232" r="11" fill="#BFDBFE" filter="url(#soft)" />
      <circle cx="214" cy="228" r="4"  fill="rgba(255,255,255,0.36)" />

      {/* Dashed connector lines */}
      <line x1="224" y1="84"  x2="244" y2="118" stroke="rgba(103,232,249,0.24)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="113" y1="150" x2="92"  y2="196" stroke="rgba(196,181,253,0.22)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="170" y1="228" x2="207" y2="230" stroke="rgba(191,219,254,0.22)" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Sparkle accents */}
      <text x="296" y="78"  fontSize="17" fill="#C4B5FD" opacity="0.72">✦</text>
      <text x="20"  y="148" fontSize="13" fill="#67E8F9"  opacity="0.62">✦</text>
      <text x="304" y="232" fontSize="10" fill="#FCA5A5"  opacity="0.62">✦</text>
      <text x="152" y="24"  fontSize="9"  fill="#C4B5FD"  opacity="0.48">✦</text>
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Blob 1 — top right */}
      <div
        className="lp-blob absolute top-[-18%] right-[-6%] w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-iris) 0%, var(--lp-cyan) 48%, transparent 70%)',
          opacity: 0.2,
          filter: 'blur(72px)',
        }}
      />
      {/* Blob 2 — bottom left */}
      <div
        className="lp-blob-2 absolute bottom-[-22%] left-[-4%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-coral) 0%, var(--lp-iris) 55%, transparent 72%)',
          opacity: 0.14,
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Text content */}
        <div>
          {/* Badge */}
          <div
            className="lp-fade-up lp-display inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
            style={{
              animationDelay: '0ms',
              backgroundColor: 'var(--lp-surface)',
              color: 'var(--lp-body)',
              border: '1px solid var(--lp-border)',
            }}
          >
            <span style={{ color: 'var(--lp-iris)' }}>✦</span>
            RAG-powered knowledge workspace
            <span
              className="h-1.5 w-1.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: '#48bb78', boxShadow: '0 0 6px #48bb78' }}
            />
          </div>

          {/* Headline */}
          <h1
            className="lp-display lp-fade-up font-bold tracking-[-0.036em] leading-[1.03] mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
              animationDelay: '80ms',
              color: 'var(--lp-ink)',
            }}
          >
            Your research,
            <br />
            unified &{' '}
            <span className="relative inline-block" style={{ color: 'var(--lp-ink-2)' }}>
              queryable
              <span
                className="lp-sparkle-spin absolute -top-3 -right-7 text-base"
                style={{ color: 'var(--lp-iris)' }}
              >
                ✦
              </span>
            </span>
            .
          </h1>

          {/* Subline */}
          <p
            className="lp-fade-up text-base sm:text-lg leading-relaxed mb-10 max-w-[460px]"
            style={{ animationDelay: '160ms', color: 'var(--lp-body)' }}
          >
            NexusNote organizes your notes, PDFs, and web links into isolated knowledge
            bases — then answers your questions with precision AI grounded strictly in
            your data.
          </p>

          {/* CTAs */}
          <div
            className="lp-fade-up flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/signup"
              className="lp-glow-btn lp-display inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.04] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            >
              <span style={{ color: 'var(--lp-iris)' }}>✦</span>
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="lp-display inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:opacity-70"
              style={{ color: 'var(--lp-body)', border: '1px solid var(--lp-border)' }}
            >
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <p
            className="lp-fade-up mt-6 text-xs"
            style={{ animationDelay: '320ms', color: 'var(--lp-muted)' }}
          >
            Free to start · No credit card · 5 workspaces included
          </p>
        </div>

        {/* Right: Illustration */}
        <div
          className="lp-fade-in lp-float relative flex items-center justify-center"
          style={{ animationDelay: '200ms' }}
        >
          <KnowledgeOrb />
        </div>
      </div>
    </section>
  )
}
