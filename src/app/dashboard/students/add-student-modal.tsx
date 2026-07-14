"use client"

import { useActionState, useState } from "react"
import { createStudent } from "@/actions/student"
import { CLASS_LEVELS, ADMISSION_STATUSES } from "@/lib/student-constants"

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

function StudentForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(createStudent, undefined)

  if (state?.success) {
    return (
      <div className="flex flex-col items-center py-10 px-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">Student added!</p>
        <p className="text-xs text-gray-500 mb-6">{state.message}</p>
        <button
          onClick={onSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <form action={action}>
      <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 text-gray-900 max-h-[60vh]">
        {state?.message && !state.success && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {state.message}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" error={state?.errors?.firstName?.[0]}>
            <input
              name="firstName"
              type="text"
              placeholder="e.g. Chidera"
              className={inp}
            />
          </Field>
          <Field label="Last name" error={state?.errors?.lastName?.[0]}>
            <input
              name="lastName"
              type="text"
              placeholder="e.g. Okafor"
              className={inp}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date of birth" error={state?.errors?.dateOfBirth?.[0]}>
            <input
              name="dateOfBirth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className={inp}
            />
          </Field>
          <Field label="Gender" error={state?.errors?.gender?.[0]}>
            <select name="gender" defaultValue="" className={inp}>
              <option value="" disabled>
                Select
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
        </div>

        <Field label="Class level" error={state?.errors?.classLevel?.[0]}>
          <select name="classLevel" defaultValue="" className={inp}>
            <option value="" disabled>
              Select class
            </option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Admission number"
          hint="Optional"
          error={state?.errors?.admissionNumber?.[0]}
        >
          <input
            name="admissionNumber"
            type="text"
            placeholder="e.g. ADM/2024/001"
            className={inp}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Parent / Guardian name" hint="Optional">
            <input
              name="parentName"
              type="text"
              placeholder="Full name"
              className={inp}
            />
          </Field>
          <Field
            label="Parent phone"
            hint="Optional"
            error={state?.errors?.parentPhone?.[0]}
          >
            <input
              name="parentPhone"
              type="tel"
              placeholder="e.g. 08012345678"
              className={inp}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Admission status"
            hint="Optional — defaults to Active"
            error={state?.errors?.admissionStatus?.[0]}
          >
            <select name="admissionStatus" defaultValue="Active" className={inp}>
              {ADMISSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Current balance (₦)"
            hint="Optional — defaults to 0"
            error={state?.errors?.currentBalance?.[0]}
          >
            <input
              name="currentBalance"
              type="number"
              step="0.01"
              placeholder="0"
              className={inp}
            />
          </Field>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Adding…" : "Add student"}
        </button>
      </div>
    </form>
  )
}

export default function AddStudentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [formKey, setFormKey] = useState(0)

  const handleSuccess = () => {
    setFormKey((k) => k + 1)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add student</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <StudentForm key={formKey} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
