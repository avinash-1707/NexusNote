'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LandingNav() {
  const { scrollY } = useScroll()

  const boxShadow = useTransform(scrollY, [0, 100], [
    '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(167,139,250,0.07)',
    '0 8px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(167,139,250,0.18)',
  ])

  const bgOpacity = useTransform(scrollY, [0, 80], [0.55, 0.82])

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <motion.header
        className="pointer-events-auto w-full max-w-[860px]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'var(--lp-surface-glass)',
          borderRadius: 9999,
          border: '1px solid var(--lp-border)',
          boxShadow,
        }}
      >
        <div className="h-[54px] flex items-center justify-between px-5 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold lp-display shrink-0"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              N
            </motion.div>
            <span
              className="lp-display font-semibold text-sm tracking-tight hidden sm:block"
              style={{ color: 'var(--lp-ink)' }}
            >
              NexusNote
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
            ].map(({ label, href }) => (
              <motion.div key={label} whileHover="hover" initial="rest">
                <Link
                  href={href}
                  className="lp-display text-sm font-medium relative py-1"
                  style={{ color: 'var(--lp-ink)' }}
                >
                  <motion.span
                    variants={{ rest: { opacity: 0.55 }, hover: { opacity: 1 } }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    {label}
                  </motion.span>
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-px rounded-full"
                    style={{ backgroundColor: 'var(--lp-iris)' }}
                    variants={{ rest: { scaleX: 0, opacity: 0 }, hover: { scaleX: 1, opacity: 1 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:block lp-display text-sm px-3.5 py-2 rounded-xl font-medium transition-opacity opacity-55 hover:opacity-100"
              style={{ color: 'var(--lp-ink)' }}
            >
              Log in
            </Link>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link
                href="/signup"
                className="lp-display text-sm px-5 py-2.5 rounded-full font-semibold block"
                style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </div>
  )
}
