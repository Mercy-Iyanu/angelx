"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/actions/auth"

type School = { name: string; nappsVerificationStatus: string }

const statusStyle = (s: string) =>
  s === "verified"
    ? "bg-green-100 text-green-700"
    : s === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"

const HOME_ICON =
  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
const STUDENTS_ICON =
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
const USER_ICON =
  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"

export default function DashboardShell({
  userEmail,
  school,
  children,
}: {
  userEmail: string
  school: School | null
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-gray-900 shrink-0">AngelX</span>
          {school && (
            <>
              <span className="text-gray-300 select-none shrink-0">·</span>
              <span className="text-sm font-medium text-gray-700 truncate">
                {school.name} NAPPS
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${statusStyle(school.nappsVerificationStatus)}`}
              >
                {school.nappsVerificationStatus.charAt(0).toUpperCase() +
                  school.nappsVerificationStatus.slice(1)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 flex flex-col py-4 shrink-0 transition-[width] duration-200 overflow-hidden ${
            collapsed ? "w-14" : "w-52"
          }`}
        >
          <div
            className={`flex mb-3 ${collapsed ? "justify-center" : "justify-end px-2"}`}
          >
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
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
                  d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-2">
            <NavItem
              href="/dashboard"
              label="Dashboard"
              icon={HOME_ICON}
              active={pathname === "/dashboard"}
              collapsed={collapsed}
            />
            <NavItem
              href="/dashboard/students"
              label="Students"
              icon={STUDENTS_ICON}
              active={pathname.startsWith("/dashboard/students")}
              collapsed={collapsed}
            />
            <NavItem
              href="/dashboard/profile"
              label="Profile"
              icon={USER_ICON}
              active={pathname === "/dashboard/profile"}
              collapsed={collapsed}
            />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}
