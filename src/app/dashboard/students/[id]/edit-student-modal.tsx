"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { updateStudent } from "@/actions/student"
import { CLASS_LEVELS } from "@/lib/student-constants"

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

export type EditableStudent = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  classLevel: string
  admissionNumber: string
  parentName: string
  parentPhone: string
  parentEmail: string
  currentBalance: number
  photoUrl: string
}

export default function EditStudentModal({
  studentId,
  student,
  onClose,
}: {
  studentId: string
  student: EditableStudent
  onClose: () => void
}) {
  const router = useRouter()
  const updateWithId = updateStudent.bind(null, studentId)
  const [state, action, pending] = useActionState(updateWithId, undefined)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

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
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Edit student</h2>
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
                  defaultValue={student.firstName}
                  className={inp}
                />
              </Field>
              <Field label="Last name" error={state?.errors?.lastName?.[0]}>
                <input
                  name="lastName"
                  type="text"
                  defaultValue={student.lastName}
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
                  defaultValue={student.dateOfBirth}
                  className={inp}
                />
              </Field>
              <Field label="Gender" error={state?.errors?.gender?.[0]}>
                <select name="gender" defaultValue={student.gender} className={inp}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
            </div>

            <Field
              label="Photo"
              hint="Optional"
              error={photoError || state?.errors?.photo?.[0]}
            >
              <div className="flex items-center gap-3">
                {photoPreview || student.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview || student.photoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200" />
                )}
                <input
                  name="photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && file.size > 4 * 1024 * 1024) {
                      setPhotoError("Photo must be smaller than 4MB.")
                      setPhotoPreview(null)
                      e.target.value = ""
                      return
                    }
                    setPhotoError(null)
                    setPhotoPreview(file ? URL.createObjectURL(file) : null)
                  }}
                  className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
                />
              </div>
            </Field>

            <Field label="Class level" error={state?.errors?.classLevel?.[0]}>
              <select name="classLevel" defaultValue={student.classLevel} className={inp}>
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
                defaultValue={student.admissionNumber}
                className={inp}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Parent / Guardian name" hint="Optional">
                <input
                  name="parentName"
                  type="text"
                  placeholder="Full name"
                  defaultValue={student.parentName}
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
                  defaultValue={student.parentPhone}
                  className={inp}
                />
              </Field>
            </div>

            <Field
              label="Parent email"
              hint="Optional"
              error={state?.errors?.parentEmail?.[0]}
            >
              <input
                name="parentEmail"
                type="email"
                placeholder="parent@example.com"
                defaultValue={student.parentEmail}
                className={inp}
              />
            </Field>

            <Field label="Current balance (₦)" error={state?.errors?.currentBalance?.[0]}>
              <input
                name="currentBalance"
                type="number"
                step="0.01"
                defaultValue={student.currentBalance}
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
