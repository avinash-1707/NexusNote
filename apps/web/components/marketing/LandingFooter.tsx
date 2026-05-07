import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer
      className="relative px-6 lg:px-8 py-10"
      style={{ backgroundColor: 'var(--lp-footer-bg)', borderTop: '1px solid rgba(232,221,208,0.06)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo wordmark */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold lp-display"
            style={{ backgroundColor: '#E8DDD0', color: '#071A18' }}
          >
            N
          </div>
          <span className="lp-display font-semibold text-sm" style={{ color: '#E8DDD0' }}>
            NexusNote
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {[
            { href: '/login', label: 'Sign in' },
            { href: '/signup', label: 'Sign up' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="lp-display text-xs transition-opacity opacity-40 hover:opacity-80"
              style={{ color: '#E8DDD0' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="lp-display text-xs" style={{ color: '#7A6F63' }}>
          © {new Date().getFullYear()} NexusNote · Built for researchers &amp; knowledge workers
        </p>
      </div>
    </footer>
  )
}
