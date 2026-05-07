import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { ThemeToggle } from '@/components/ThemeToggle'

const bricolage = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  variable: '--font-body-lp',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bricolage.variable} ${dmSans.variable} lp-root min-h-screen flex items-center justify-center p-6 relative overflow-hidden`}
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div
        className="lp-blob absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-iris) 0%, var(--lp-cyan) 48%, transparent 70%)',
          opacity: 0.18,
          filter: 'blur(72px)',
        }}
      />
      <div
        className="lp-blob-2 absolute bottom-[-20%] left-[-10%] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-coral) 0%, var(--lp-iris) 55%, transparent 72%)',
          opacity: 0.12,
          filter: 'blur(72px)',
        }}
      />
      {children}
    </div>
  )
}
