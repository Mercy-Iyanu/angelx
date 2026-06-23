'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/actions/auth'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Reset your password
      </h1>
      <p className="text-sm text-gray-500 mb-8">Enter your new password below.</p>

      {state?.message && (
        <p className="text-sm text-red-600 mb-4">{state.message}</p>
      )}

      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            New password
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
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state?.errors?.confirmPassword && (
            <p className="text-xs text-red-600">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </>
  )
}
