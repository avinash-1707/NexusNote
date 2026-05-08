import { ThemeToggle } from '@/components/ThemeToggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-root min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
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
