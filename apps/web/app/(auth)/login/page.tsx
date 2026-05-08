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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

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

        {/* Divider */}
        <div className="relative my-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--lp-border)' }} />
          <span
            className="lp-display text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--lp-muted)' }}
          >
            or
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--lp-border)' }} />
        </div>

        {/* Google */}
        <motion.button
          type="button"
          className="lp-glass lp-display w-full flex items-center justify-center gap-3 py-3.5 rounded-full text-sm font-medium"
          style={{ border: '1px solid var(--lp-border)', color: 'var(--lp-ink)' }}
          whileHover={{ scale: 1.02, opacity: 0.85 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>
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
