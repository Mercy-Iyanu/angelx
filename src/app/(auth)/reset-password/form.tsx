'use client'

import { useActionState, useState } from 'react'
import { resetPassword, type ResetPasswordState } from '@/actions/auth'

const initialState: ResetPasswordState = {}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10">
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">AngelX</span>
            <p className="mt-1 text-sm text-zinc-500">Choose a new password</p>
          </div>

          {state.errors?.general && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.errors.general}{' '}
              {state.errors.general.includes('expired') && (
                <a href="/forgot-password" className="underline font-medium">
                  Request a new link
                </a>
              )}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="token" value={token} />

            {/* New password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 ${
                    state.errors?.password ? 'border-red-400 bg-red-50' : 'border-zinc-300 bg-white'
                  }`}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {state.errors?.password && (
                <p className="mt-1.5 text-xs text-red-600">{state.errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 ${
                    state.errors?.confirm ? 'border-red-400 bg-red-50' : 'border-zinc-300 bg-white'
                  }`}
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {state.errors?.confirm && (
                <p className="mt-1.5 text-xs text-red-600">{state.errors.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
