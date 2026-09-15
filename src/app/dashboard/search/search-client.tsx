"use client"

import { Fragment, useActionState, useState, useTransition } from "react"
import {
  searchEnrollment,
  requestFeeStandingReport,
  type CrossSchoolMatch,
  type FeeStandingResult,
  type RecentRequest,
} from "@/actions/crossSchool"

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"

function formatBalance(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const statusStyle = (s: string) =>
  s === "Active"
    ? "bg-green-100 text-green-700"
    : s === "Exited-Cleared"
      ? "bg-gray-100 text-gray-600"
      : s === "Exited-Unresolved"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default function SearchClient({
  verified,
  recentRequests,
}: {
  verified: boolean
  recentRequests: RecentRequest[]
}) {
  const [state, formAction, pending] = useActionState(searchEnrollment, undefined)
  const [reports, setReports] = useState<Record<string, FeeStandingResult>>({})
  const [requesting, setRequesting] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRequest = (match: CrossSchoolMatch) => {
    setRequestError(null)
    setRequesting(match.studentId)
    startTransition(async () => {
      const result = await requestFeeStandingReport(match.studentId, match.matchScore)
      setRequesting(null)
      if (result?.success && result.result) {
        setReports((prev) => ({ ...prev, [match.studentId]: result.result as FeeStandingResult }))
      } else {
        setRequestError(result?.message ?? "Could not fetch fee standing report.")
      }
    })
  }

  if (!verified) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-gray-300 bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Fee Standing Search is locked
        </p>
        <p className="text-xs text-gray-400 max-w-sm">
          This searches pupil records across other NAPPS schools, so it&apos;s only
          available once your school&apos;s NAPPS registration is verified. Check
          your{" "}
          <a href="/dashboard/profile" className="text-blue-600 hover:underline">
            profile
          </a>{" "}
          for verification status.
        </p>
      </div>
    )
  }

  const results = state?.results ?? []

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Fee Standing Search</h1>

      <form
        action={formAction}
        className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-6"
      >
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Find a pupil at another NAPPS school
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              First name *
            </label>
            <input name="firstName" required className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Last name *
            </label>
            <input name="lastName" required className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Date of birth (optional, boosts accuracy)
            </label>
            <input name="dateOfBirth" type="date" className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Parent phone (optional, boosts accuracy)
            </label>
            <input name="parentPhone" className={inp} />
          </div>
        </div>
        {state?.message && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Searching…" : "Search"}
        </button>
      </form>

      {requestError && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">
          {requestError}
        </p>
      )}

      {state?.success && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pupil
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Match
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      No matches found across other schools.
                    </td>
                  </tr>
                ) : (
                  results.map((m) => {
                    const report = reports[m.studentId]
                    return (
                      <Fragment key={m.studentId}>
                        <tr className="align-top">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                                {initials(m.firstName, m.lastName)}
                              </div>
                              <div>
                                {m.firstName} {m.lastName}
                                <div className="text-xs text-gray-400">
                                  {formatDate(m.dateOfBirth)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{m.schoolName}</td>
                          <td className="px-4 py-3 text-gray-600">{m.classLevel}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyle(m.admissionStatus)}`}
                            >
                              {m.admissionStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{m.matchScore}%</td>
                          <td className="px-4 py-3 text-right">
                            {!report && (
                              <button
                                onClick={() => handleRequest(m)}
                                disabled={isPending && requesting === m.studentId}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                {isPending && requesting === m.studentId
                                  ? "Requesting…"
                                  : "Request Fee Standing Report"}
                              </button>
                            )}
                          </td>
                        </tr>
                        {report && (
                          <tr>
                            <td colSpan={6} className="px-4 pb-4">
                              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
                                <div>
                                  <dt className="text-xs text-gray-400">
                                    Outstanding balance
                                  </dt>
                                  <dd
                                    className={`text-sm font-medium ${report.currentBalance > 0 ? "text-red-600" : "text-gray-900"}`}
                                  >
                                    {report.currentBalance > 0
                                      ? formatBalance(report.currentBalance)
                                      : "None"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-400">Admission status</dt>
                                  <dd className="text-sm text-gray-900">
                                    {report.admissionStatus}
                                  </dd>
                                </div>
                                {report.exitNotes && (
                                  <div>
                                    <dt className="text-xs text-gray-400">Exit notes</dt>
                                    <dd className="text-sm text-gray-900">{report.exitNotes}</dd>
                                  </div>
                                )}
                                {report.tcCertificateNumber && (
                                  <div>
                                    <dt className="text-xs text-gray-400">TC number</dt>
                                    <dd className="text-sm text-gray-900">
                                      {report.tcCertificateNumber}
                                    </dd>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Recent requests from your school
        </p>
        {recentRequests.length === 0 ? (
          <p className="text-xs text-gray-400">No fee standing reports requested yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pupil
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      School
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.pupilName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.schoolName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyle(r.admissionStatus)}`}
                        >
                          {r.admissionStatus}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 ${r.currentBalance > 0 ? "text-red-600 font-medium" : "text-gray-400"}`}
                      >
                        {r.currentBalance > 0 ? formatBalance(r.currentBalance) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
