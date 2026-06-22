'use client'

import { useActionState, useState } from 'react'
import { createAccount, type SignupState } from '@/actions/auth'

const initialState: SignupState = {}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(createAccount, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [tosOpen, setTosOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">AngelX</span>
            <p className="mt-1 text-sm text-zinc-500">Create your account</p>
          </div>

          {state.errors?.general && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.errors.general}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
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
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {state.errors?.password && (
                <p className="mt-1.5 text-xs text-red-600">{state.errors.password}</p>
              )}
            </div>

            {/* Terms of Service */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="tos"
                  value="agreed"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-600">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setTosOpen(true)}
                    className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600"
                  >
                    Terms of Service
                  </button>
                </span>
              </label>
              {state.errors?.tos && (
                <p className="mt-1.5 text-xs text-red-600">{state.errors.tos}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-zinc-900 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* ToS Modal */}
      {tosOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setTosOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setTosOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg font-bold text-zinc-900 mb-1">Terms of Service</h2>
            <p className="text-xs text-zinc-400 mb-6">Last updated: June 2026</p>

            <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">1. Acceptance of Terms</h3>
                <p>By creating an account on AngelX, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, please do not use our services.</p>
              </section>
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">2. Use of Service</h3>
                <p>AngelX grants you a limited, non-exclusive, non-transferable license to use our platform for its intended purposes. You agree not to misuse the service, engage in unauthorized access, or disrupt the experience of other users.</p>
              </section>
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">3. Account Responsibility</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
              </section>
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">4. Privacy</h3>
                <p>Your use of AngelX is also governed by our Privacy Policy. We collect and process your data in accordance with applicable data protection laws.</p>
              </section>
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">5. Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. You may also delete your account at any time from your account settings.</p>
              </section>
              <section>
                <h3 className="font-semibold text-zinc-800 mb-1">6. Changes to Terms</h3>
                <p>AngelX may update these Terms of Service from time to time. Continued use of the platform after changes constitutes your acceptance of the new terms.</p>
              </section>
            </div>

            <button
              onClick={() => setTosOpen(false)}
              className="mt-8 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
