'use client'

import { useActionState } from 'react'
import { requestPasswordReset, type ForgotPasswordState } from '@/actions/auth'

const initialState: ForgotPasswordState = {}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">Check your email</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              If that email is registered, you&apos;ll receive a password reset link shortly. The link expires in 1 hour.
            </p>
            <p className="mt-4 text-xs text-zinc-400">
              Didn&apos;t get it? Check your spam folder or{' '}
              <button
                onClick={() => window.location.reload()}
                className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10">
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">AngelX</span>
            <p className="mt-1 text-sm text-zinc-500">Reset your password</p>
          </div>

          <p className="mb-5 text-sm text-zinc-500">
            Enter the email address for your account and we&apos;ll send you a reset link.
          </p>

          {state.errors?.general && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.errors.general}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 ${
                  state.errors?.email ? 'border-red-400 bg-red-50' : 'border-zinc-300 bg-white'
                }`}
                placeholder="you@example.com"
              />
              {state.errors?.email && (
                <p className="mt-1.5 text-xs text-red-600">{state.errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Remember your password?{' '}
            <a href="/login" className="font-medium text-zinc-900 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
