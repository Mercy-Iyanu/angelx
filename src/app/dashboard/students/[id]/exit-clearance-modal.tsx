"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  emailBalanceInvoice,
  confirmClearance,
  withdrawWithoutClearance,
} from "@/actions/student"

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

function formatBalance(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

export default function ExitClearanceModal({
  studentId,
  studentName,
  currentBalance,
  parentEmail,
  onClose,
}: {
  studentId: string
  studentName: string
  currentBalance: number
  parentEmail: string
  onClose: () => void
}) {
  const router = useRouter()
  const [showWithdraw, setShowWithdraw] = useState(false)

  const emailAction = emailBalanceInvoice.bind(null, studentId)
  const [emailState, emailFormAction, emailPending] = useActionState(emailAction, undefined)

  const clearAction = confirmClearance.bind(null, studentId)
  const [clearState, clearFormAction, clearPending] = useActionState(clearAction, undefined)

  const withdrawAction = withdrawWithoutClearance.bind(null, studentId)
  const [withdrawState, withdrawFormAction, withdrawPending] = useActionState(
    withdrawAction,
    undefined
  )

  const succeeded = clearState?.success || withdrawState?.success

  useEffect(() => {
    if (succeeded) {
      router.refresh()
      onClose()
    }
  }, [succeeded, router, onClose])

  if (succeeded) return null

  const cleared = currentBalance <= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Exit clearance</h2>
            <p className="text-xs text-gray-400 mt-0.5">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {cleared ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm font-medium text-green-800">
                No outstanding balance
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                This student is ready for clearance.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-medium text-red-800">
                Outstanding balance: {formatBalance(currentBalance)}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Clearance is blocked until this is settled. Advise the parent to pay
                up, or send an emailed invoice below.
              </p>
            </div>
          )}

          {!cleared && (
            <form action={emailFormAction} className="flex flex-col gap-2">
              {emailState?.message && (
                <p
                  className={`text-xs px-3 py-2 rounded-lg ${
                    emailState.success
                      ? "text-green-700 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {emailState.message}
                </p>
              )}
              <label className="text-sm font-medium text-gray-700">
                Email invoice to parent
              </label>
              <div className="flex gap-2">
                <input
                  name="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  defaultValue={parentEmail}
                  className={inp}
                />
                <button
                  type="submit"
                  disabled={emailPending}
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {emailPending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}

          <form action={clearFormAction}>
            {clearState?.message && !clearState.success && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-2">
                {clearState.message}
              </p>
            )}
            <button
              type="submit"
              disabled={clearPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {clearPending
                ? "Processing…"
                : cleared
                  ? "Approve & issue Transfer Certificate"
                  : "Confirm payment received & issue TC"}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100">
            {!showWithdraw ? (
              <button
                onClick={() => setShowWithdraw(true)}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              >
                Withdraw without clearance instead
              </button>
            ) : (
              <form action={withdrawFormAction} className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                  This bypasses the balance check and marks the student{" "}
                  <strong>Exited-Unresolved</strong>. No Transfer Certificate is
                  issued, and this flags the record for other schools.
                </p>
                {withdrawState?.message && !withdrawState.success && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {withdrawState.message}
                  </p>
                )}
                <textarea
                  name="reason"
                  rows={2}
                  placeholder="Reason for withdrawing without clearance…"
                  className={inp}
                />
                <button
                  type="submit"
                  disabled={withdrawPending}
                  className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {withdrawPending ? "Processing…" : "Confirm withdrawal without clearance"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
