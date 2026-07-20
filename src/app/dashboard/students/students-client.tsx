"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AddStudentModal from "./add-student-modal"
import ImportCSVModal from "./import-csv-modal"

type Student = {
  id: string
  firstName: string
  lastName: string
  gender: string
  classLevel: string
  admissionNumber: string
  parentName: string
  enrollmentDate: string
  admissionStatus: string
  currentBalance: number
  createdAt: string
  photoUrl: string
}

type SortBy = "recent" | "name" | "balance"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatBalance(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

const statusStyle = (s: string) =>
  s === "Active"
    ? "bg-green-100 text-green-700"
    : s === "Exited-Cleared"
      ? "bg-gray-100 text-gray-600"
      : s === "Exited-Unresolved"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"

const isLeft = (status: string) =>
  status === "Exited-Cleared" || status === "Exited-Unresolved"

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function sortStudents(students: Student[], sortBy: SortBy): Student[] {
  const copy = [...students]
  if (sortBy === "recent") {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  if (sortBy === "balance") {
    return copy.sort((a, b) => b.currentBalance - a.currentBalance)
  }
  return copy.sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
  )
}

export default function StudentsClient({
  students,
  hasSchool,
}: {
  students: Student[]
  hasSchool: boolean
}) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("recent")
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [modal, setModal] = useState<"manual" | "csv" | null>(null)
  const router = useRouter()

  const filtered = search
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : students

  const sorted = sortStudents(filtered, sortBy)

  const handleSuccess = () => {
    setModal(null)
    router.refresh()
  }

  if (!hasSchool) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Register your school before adding students.
        </p>
        <a
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Go to dashboard
        </a>
      </div>
    )
  }

  return (
    <>
      {modal === "manual" && (
        <AddStudentModal
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {modal === "csv" && (
        <ImportCSVModal
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {students.length}
          </span>
        </div>

        {/* Add student dropdown */}
        <div className="relative">
          <button
            onClick={() => setAddMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Add student
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {addMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAddMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setAddMenuOpen(false)
                    setModal("manual")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Add manually
                </button>
                <button
                  onClick={() => {
                    setAddMenuOpen(false)
                    setModal("csv")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Import from CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState onAdd={() => setModal("manual")} onImport={() => setModal("csv")} />
      ) : (
        <>
          {/* Search + sort */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs text-gray-500 shrink-0">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-sm border border-gray-300 rounded-lg px-2.5 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="recent">Recently added</option>
                <option value="name">Name (A–Z)</option>
                <option value="balance">Outstanding balance</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Adm. No.
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Parent / Guardian
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorted.length > 0 ? (
                    sorted.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => router.push(`/dashboard/students/${s.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") router.push(`/dashboard/students/${s.id}`)
                        }}
                        tabIndex={0}
                        role="button"
                        className="hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            {s.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={s.photoUrl}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                                {initials(s.firstName, s.lastName)}
                              </div>
                            )}
                            {s.firstName} {s.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyle(s.admissionStatus)}`}
                          >
                            {isLeft(s.admissionStatus) ? "Left" : s.admissionStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.classLevel}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{s.gender}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.admissionNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.parentName || "—"}
                        </td>
                        <td
                          className={`px-4 py-3 whitespace-nowrap ${
                            s.currentBalance > 0
                              ? "text-red-600 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {s.currentBalance > 0 ? formatBalance(s.currentBalance) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(s.enrollmentDate)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-400"
                      >
                        No students match &ldquo;{search}&rdquo;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function EmptyState({
  onAdd,
  onImport,
}: {
  onAdd: () => void
  onImport: () => void
}) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No students yet</p>
      <p className="text-xs text-gray-400 mb-6">
        Add students one by one or import a CSV file.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Add manually
        </button>
        <button
          onClick={onImport}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Import CSV
        </button>
      </div>
    </div>
  )
}
