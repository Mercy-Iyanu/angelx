"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined);

  if (state?.message) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📩</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-gray-500 mb-8">{state.message}</p>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Forgot your password?
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={action} className="flex flex-col gap-5 text-gray-900">
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

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>

        <Link
          href="/login"
          className="text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Back to sign in
        </Link>
      </form>
    </>
  );
}
