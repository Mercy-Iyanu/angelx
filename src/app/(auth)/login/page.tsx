'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined)

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state?.errors?.password && (
            <p className="text-xs text-red-600">{state.errors.password[0]}</p>
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
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  )
}
