"use client"

import { useActionState, useState, useEffect, startTransition } from "react"
import { createSchool } from "@/actions/school"
import { SCHOOL_TYPES, OGUN_LGAS } from "@/lib/school-constants"

type F = {
  name: string
  nappsRegNumber: string
  schoolType: string
  yearEstablished: string
  studentPopulation: string
  lga: string
  town: string
  address: string
  phone: string
  proprietorName: string
  proprietorPhone: string
}

const init: F = {
  name: "",
  nappsRegNumber: "",
  schoolType: "",
  yearEstablished: "",
  studentPopulation: "",
  lga: "",
  town: "",
  address: "",
  phone: "",
  proprietorName: "",
  proprietorPhone: "",
}

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

const STEPS = ["School info", "Location", "Contact"]

export default function SchoolRegistrationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, action, pending] = useActionState(createSchool, undefined)
  const [step, setStep] = useState(0)
  const [f, setF] = useState<F>(init)
  const [errs, setErrs] = useState<Partial<Record<keyof F, string>>>({})

  const set =
    (k: keyof F) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setF((prev) => ({ ...prev, [k]: e.target.value }))
      setErrs((prev) => {
        const next = { ...prev }
        delete next[k]
        return next
      })
    }

  // If server returns field errors for an earlier step, navigate back to it
  useEffect(() => {
    const se = state?.errors
    if (!se) return
    if (se.name || se.nappsRegNumber || se.schoolType) setStep(0)
    else if (se.yearEstablished || se.studentPopulation || se.lga || se.town || se.address) setStep(1)
  }, [state?.errors])

  const next = () => {
    const e: typeof errs = {}
    if (step === 0) {
      if (!f.name.trim()) e.name = "Required"
      if (!f.nappsRegNumber.trim()) e.nappsRegNumber = "Required"
      if (!f.schoolType) e.schoolType = "Select a school type"
    } else if (step === 1) {
      const yr = Number(f.yearEstablished)
      const now = new Date().getFullYear()
      if (!f.yearEstablished || yr < 1800 || yr > now)
        e.yearEstablished = `Enter a year between 1800 and ${now}`
      if (!f.studentPopulation || Number(f.studentPopulation) < 1)
        e.studentPopulation = "Required"
      if (!f.lga) e.lga = "Select an LGA"
      if (!f.town.trim()) e.town = "Required"
      if (!f.address.trim()) e.address = "Required"
    }
    setErrs(e)
    if (!Object.keys(e).length) setStep((s) => s + 1)
  }

  const submit = () => {
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.set(k, v))
    startTransition(() => {
      action(fd)
    })
  }

  if (state?.success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col items-center px-8 py-10 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Registration complete!
          </h2>
          <p className="text-sm text-gray-500 mb-6">{state.message}</p>
          <button
            onClick={onSuccess}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                School registration
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 -mt-0.5 -mr-0.5 text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      i < step
                        ? "bg-blue-600 text-white"
                        : i === step
                          ? "ring-1 ring-blue-500 bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      i === step ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 transition-colors ${
                      i < step ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 text-gray-900">
          {/* Step 0 — School info */}
          {step === 0 && (
            <>
              <Field
                label="School name"
                error={errs.name ?? state?.errors?.name?.[0]}
              >
                <input
                  value={f.name}
                  onChange={set("name")}
                  type="text"
                  placeholder="e.g. Greenfield Academy"
                  className={inp}
                />
              </Field>
              <Field
                label="NAPPS registration number"
                error={errs.nappsRegNumber ?? state?.errors?.nappsRegNumber?.[0]}
              >
                <input
                  value={f.nappsRegNumber}
                  onChange={set("nappsRegNumber")}
                  type="text"
                  placeholder="e.g. OGN/2024/001"
                  className={inp}
                />
              </Field>
              <Field
                label="School type"
                error={errs.schoolType ?? state?.errors?.schoolType?.[0]}
              >
                <select
                  value={f.schoolType}
                  onChange={set("schoolType")}
                  className={inp}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {SCHOOL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Year established"
                  error={
                    errs.yearEstablished ?? state?.errors?.yearEstablished?.[0]
                  }
                >
                  <input
                    value={f.yearEstablished}
                    onChange={set("yearEstablished")}
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2005"
                    className={inp}
                  />
                </Field>
                <Field
                  label="Student population"
                  error={
                    errs.studentPopulation ??
                    state?.errors?.studentPopulation?.[0]
                  }
                >
                  <input
                    value={f.studentPopulation}
                    onChange={set("studentPopulation")}
                    type="number"
                    min={1}
                    placeholder="e.g. 450"
                    className={inp}
                  />
                </Field>
              </div>
              <Field label="LGA" error={errs.lga ?? state?.errors?.lga?.[0]}>
                <select value={f.lga} onChange={set("lga")} className={inp}>
                  <option value="" disabled>
                    Select LGA
                  </option>
                  {OGUN_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Town / Area"
                error={errs.town ?? state?.errors?.town?.[0]}
              >
                <input
                  value={f.town}
                  onChange={set("town")}
                  type="text"
                  placeholder="e.g. Sango"
                  className={inp}
                />
              </Field>
              <Field
                label="Full address"
                error={errs.address ?? state?.errors?.address?.[0]}
              >
                <textarea
                  value={f.address}
                  onChange={set("address")}
                  rows={2}
                  placeholder="Street, area, landmark"
                  className={inp}
                />
              </Field>
            </>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <>
              {state?.message && !state.success && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {state.message}
                </p>
              )}
              <Field
                label="School phone number"
                error={state?.errors?.phone?.[0]}
              >
                <input
                  value={f.phone}
                  onChange={set("phone")}
                  type="tel"
                  placeholder="e.g. 08012345678"
                  className={inp}
                />
              </Field>
              <Field
                label="Proprietor full name"
                error={state?.errors?.proprietorName?.[0]}
              >
                <input
                  value={f.proprietorName}
                  onChange={set("proprietorName")}
                  type="text"
                  placeholder="Full legal name"
                  className={inp}
                />
              </Field>
              <Field
                label="Proprietor phone number"
                error={state?.errors?.proprietorPhone?.[0]}
              >
                <input
                  value={f.proprietorPhone}
                  onChange={set("proprietorPhone")}
                  type="tel"
                  placeholder="e.g. 08098765432"
                  className={inp}
                />
              </Field>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setStep((s) => s - 1)
                setErrs({})
              }}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Submitting…" : "Complete registration"}
            </button>
          )}
        </div>
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
