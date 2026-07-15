"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateStudent } from "@/actions/student"

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

export default function EditStudentModal({
  studentId,
  currentBalance,
  parentEmail,
  onClose,
}: {
  studentId: string
  currentBalance: number
  parentEmail: string
  onClose: () => void
}) {
  const router = useRouter()
  const updateWithId = updateStudent.bind(null, studentId)
  const [state, action, pending] = useActionState(updateWithId, undefined)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
      onClose()
    }
  }, [state?.success, router, onClose])

  if (state?.success) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Update student</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action}>
          <div className="px-6 py-5 flex flex-col gap-4 text-gray-900">
            {state?.message && !state.success && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {state.message}
              </p>
            )}

            <Field label="Current balance (₦)" error={state?.errors?.currentBalance?.[0]}>
              <input
                name="currentBalance"
                type="number"
                step="0.01"
                defaultValue={currentBalance}
                className={inp}
              />
            </Field>

            <Field
              label="Parent email"
              error={state?.errors?.parentEmail?.[0]}
            >
              <input
                name="parentEmail"
                type="email"
                placeholder="parent@example.com"
                defaultValue={parentEmail}
                className={inp}
              />
            </Field>
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
