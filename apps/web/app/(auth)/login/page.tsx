'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useLogin } from '@/lib/queries'
import { useAuth } from '@/providers/AuthProvider'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const { mutateAsync, isPending } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      const { access_token } = await mutateAsync(data)
      login(access_token)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setApiError('Invalid email or password.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <motion.div
      className="w-full max-w-[420px] relative z-10"
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
    >
      {/* Logo + heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold lp-display transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
          >
            N
          </div>
          <span className="lp-display font-semibold text-base" style={{ color: 'var(--lp-ink)' }}>
            NexusNote
          </span>
        </Link>
        <h1
          className="lp-display text-[1.75rem] font-bold tracking-[-0.03em] leading-tight"
          style={{ color: 'var(--lp-ink)' }}
        >
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--lp-body)' }}>
          Sign in to your workspace
        </p>
      </div>

      {/* Glass card */}
      <div
        className="lp-glass rounded-3xl p-7"
        style={{ border: '1px solid var(--lp-border)', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="lp-display text-xs font-semibold tracking-wide block"
              style={{ color: 'var(--lp-body)' }}
            >
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`lp-auth-input${errors.email ? ' has-error' : ''}`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  key="email-err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs"
                  style={{ color: 'var(--lp-coral)' }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="lp-display text-xs font-semibold tracking-wide block"
              style={{ color: 'var(--lp-body)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`lp-auth-input pr-11${errors.password ? ' has-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" style={{ color: 'var(--lp-ink)' }} />
                  : <Eye className="h-4 w-4" style={{ color: 'var(--lp-ink)' }} />
                }
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  key="pw-err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs"
                  style={{ color: 'var(--lp-coral)' }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* API error */}
          <AnimatePresence>
            {apiError && (
              <motion.p
                key="api-err"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-xs py-2.5 px-3.5 rounded-xl"
                style={{
                  color: 'var(--lp-coral)',
                  backgroundColor: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.15)',
                }}
              >
                {apiError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isPending}
            className="lp-display w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-sm font-semibold mt-1 disabled:opacity-60"
            style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            whileHover={{ scale: isPending ? 1 : 1.02 }}
            whileTap={{ scale: isPending ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <span style={{ color: 'var(--lp-iris)' }}>✦</span>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm" style={{ color: 'var(--lp-body)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="lp-display font-semibold underline-offset-4 hover:underline"
          style={{ color: 'var(--lp-ink)' }}
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}
