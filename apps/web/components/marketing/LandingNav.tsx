'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'lp-glass' : 'bg-transparent'
      }`}
      style={{ borderBottom: scrolled ? '1px solid var(--lp-border)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold lp-display shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
          >
            N
          </div>
          <span
            className="lp-display font-semibold text-sm tracking-tight hidden sm:block"
            style={{ color: 'var(--lp-ink)' }}
          >
            NexusNote
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {['Features', 'How it works'].map((label) => (
            <Link
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className="lp-display text-sm font-medium transition-all opacity-55 hover:opacity-100"
              style={{ color: 'var(--lp-ink)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:block lp-display text-sm px-4 py-2 rounded-full font-medium transition-opacity opacity-60 hover:opacity-100"
            style={{ color: 'var(--lp-ink)' }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="lp-display text-sm px-5 py-2.5 rounded-full font-semibold transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
