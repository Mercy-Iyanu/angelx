"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SchoolRegistrationModal from "./school-registration-form"

type School = { name: string; nappsVerificationStatus: string }
type Stats = {
  total: number
  active: number
  male: number
  female: number
  byClass: { level: string; count: number }[]
}

export default function DashboardContent({
  school,
  stats,
}: {
  school: School | null
  stats: Stats
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <>
      {modalOpen && (
        <SchoolRegistrationModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Welcome{school ? `, ${school.name}` : ""}
      </h1>

      {!school ? (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            Complete your school registration to get full access to AngelX.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Complete school registration
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total enrolled"
              value={stats.total}
              color="blue"
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              }
            />
            <StatCard
              label="Active"
              value={stats.active}
              color="emerald"
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              }
            />
            <StatCard
              label="Boys"
              value={stats.male}
              color="indigo"
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              }
            />
            <StatCard
              label="Girls"
              value={stats.female}
              color="rose"
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              }
            />
          </div>

          {stats.total === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <p className="text-sm text-gray-500 mb-3">
                No students enrolled yet.
              </p>
              <Link
                href="/dashboard/students"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Add your first students →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Class distribution */}
              <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Students by class
                </h2>
                {stats.byClass.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.byClass.map((item) => {
                      const pct = Math.round(
                        (item.count / stats.byClass[0].count) * 100
                      )
                      return (
                        <div key={item.level} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-28 shrink-0 truncate">
                            {item.level}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-6 text-right shrink-0">
                            {item.count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Gender breakdown */}
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Gender split
                </h2>
                <GenderBreakdown
                  male={stats.male}
                  female={stats.female}
                  total={stats.total}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    value: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    value: "text-emerald-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    value: "text-indigo-700",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    value: "text-rose-700",
  },
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: keyof typeof colorMap
  icon: React.ReactNode
}) {
  const c = colorMap[color]
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-4">
      <div className={`shrink-0 w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
        <svg
          className={`w-5 h-5 ${c.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold ${c.value} leading-none`}>
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">{label}</p>
      </div>
    </div>
  )
}

function GenderBreakdown({
  male,
  female,
  total,
}: {
  male: number
  female: number
  total: number
}) {
  const malePct = total > 0 ? Math.round((male / total) * 100) : 50
  const femalePct = total > 0 ? Math.round((female / total) * 100) : 50

  return (
    <div className="flex flex-col gap-4">
      {/* Split bar */}
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        <div
          className="bg-indigo-500 h-3 rounded-l-full transition-all"
          style={{ width: `${malePct}%` }}
        />
        <div
          className="bg-rose-400 h-3 rounded-r-full transition-all"
          style={{ width: `${femalePct}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="text-sm text-gray-600">Boys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {male.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 w-9 text-right">
              {malePct}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
            <span className="text-sm text-gray-600">Girls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {female.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 w-9 text-right">
              {femalePct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
