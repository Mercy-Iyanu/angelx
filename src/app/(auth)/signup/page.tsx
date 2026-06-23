'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/actions/auth'

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Terms of Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 text-sm text-gray-600 flex flex-col gap-4">
          <p>Last updated: June 2026</p>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">1. Acceptance</h3>
            <p>
              By creating an account you agree to these Terms of Service. If you
              do not agree, do not use this service.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">2. Use of Service</h3>
            <p>
              You agree to use this platform only for lawful purposes and in
              accordance with these terms. You are responsible for all activity
              that occurs under your account.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">3. Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              password and for restricting access to your account.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">4. Privacy</h3>
            <p>
              Your use of the service is also governed by our Privacy Policy,
              which is incorporated into these terms by reference.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">5. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our
              discretion if you violate these terms.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-gray-800 mb-1">6. Changes</h3>
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, undefined)
  const [showTerms, setShowTerms] = useState(false)

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Create an account
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>

      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state?.errors?.password && (
            <p className="text-xs text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              name="terms"
              type="checkbox"
              value="on"
              className="mt-0.5 accent-blue-600"
            />
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </button>
            </span>
          </label>
          {state?.errors?.terms && (
            <p className="text-xs text-red-600">{state.errors.terms[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  )
}
