'use client'

import { useParams, useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import { useCreateSession } from '@/lib/queries'

export default function AssistantPage() {
  const params = useParams<{ workspaceId: string }>()
  const workspaceId = Number(params.workspaceId)
  const router = useRouter()
  const createSession = useCreateSession(workspaceId)

  const handleNewChat = async () => {
    const session = await createSession.mutateAsync('New Chat')
    router.push(`/workspace/${workspaceId}/assistant/${session.id}`)
  }

  return (
    <div
      className="flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 5.5rem)' }}
    >
      {/* Ambient background blobs */}
      <div
        className="lp-blob absolute top-[-15%] left-[20%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-iris) 0%, var(--lp-cyan) 50%, transparent 70%)',
          opacity: 0.1,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="lp-blob-2 absolute bottom-[-10%] right-[15%] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--lp-coral) 0%, var(--lp-iris) 55%, transparent 72%)',
          opacity: 0.08,
          filter: 'blur(72px)',
        }}
      />

      {/* Central orb graphic */}
      <div className="relative flex items-center justify-center w-48 h-48 sm:w-72 sm:h-72 mb-6 sm:mb-10">
        {/* Deep glow base */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(167,139,250,0.22) 0%, rgba(34,211,238,0.08) 45%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />

        {/* Outer ring */}
        <div
          className="lp-orb-spin absolute w-44 h-44 sm:w-64 sm:h-64 rounded-full"
          style={{ border: '1px solid rgba(167,139,250,0.1)' }}
        />

        {/* Outer ring dot */}
        <div
          className="lp-dot-orbit absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--lp-iris)',
            boxShadow: '0 0 8px var(--lp-iris)',
            top: '50%',
            left: '50%',
            marginTop: '-4px',
            marginLeft: '-4px',
          }}
        />

        {/* Middle ring */}
        <div
          className="lp-orb-spin-rev absolute w-32 h-32 sm:w-48 sm:h-48 rounded-full"
          style={{ border: '1px dashed rgba(34,211,238,0.18)' }}
        />

        {/* Inner ring */}
        <div
          className="lp-orb-spin-sm absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full"
          style={{ border: '1px solid rgba(167,139,250,0.3)' }}
        />

        {/* Core orb */}
        <div
          className="relative lp-float lp-glow-btn w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(196,181,253,0.55) 0%, rgba(167,139,250,0.28) 40%, rgba(34,211,238,0.12) 70%, transparent 100%)',
            border: '1px solid rgba(167,139,250,0.55)',
            boxShadow:
              '0 0 48px rgba(167,139,250,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <Brain
            className="h-7 w-7 sm:h-10 sm:w-10"
            style={{
              color: 'var(--lp-iris)',
              filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.9))',
            }}
          />
        </div>

        {/* Sparkles */}
        <span
          className="lp-sparkle-spin absolute text-xl select-none"
          style={{ color: 'var(--lp-iris)', opacity: 0.85, top: '14%', right: '18%' }}
        >
          ✦
        </span>
        <span
          className="lp-sparkle-spin absolute text-sm select-none"
          style={{ color: 'var(--lp-cyan)', opacity: 0.65, bottom: '16%', left: '16%', animationDelay: '1.8s' }}
        >
          ✦
        </span>
        <span
          className="lp-sparkle-spin absolute text-xs select-none"
          style={{ color: 'var(--lp-blue)', opacity: 0.5, top: '38%', left: '8%', animationDelay: '0.9s' }}
        >
          ✦
        </span>
        <span
          className="lp-sparkle-spin absolute text-xs select-none"
          style={{ color: 'var(--lp-iris)', opacity: 0.5, bottom: '28%', right: '10%', animationDelay: '3.2s' }}
        >
          ✦
        </span>
      </div>

      {/* Heading */}
      <h1
        className="lp-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-tight mb-3 lp-fade-up"
        style={{ color: 'var(--lp-ink)', animationDelay: '0.1s' }}
      >
        Your AI Research Assistant
      </h1>
      <p
        className="text-sm leading-relaxed max-w-xs mb-8 lp-fade-up"
        style={{ color: 'var(--lp-body)', animationDelay: '0.2s' }}
      >
        Ask anything about your workspace. Every answer is grounded strictly
        in your own data — nothing from outside.
      </p>

      {/* New Chat button */}
      <button
        onClick={handleNewChat}
        disabled={createSession.isPending}
        className="lp-display lp-glow-btn flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-85 lp-fade-up"
        style={{
          backgroundColor: 'var(--lp-ink)',
          color: 'var(--lp-bg)',
          animationDelay: '0.3s',
        }}
      >
        {createSession.isPending ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Starting…
          </>
        ) : (
          <>
            <span style={{ color: 'var(--lp-iris)' }}>✦</span>
            New Chat
          </>
        )}
      </button>
    </div>
  )
}
