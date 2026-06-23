"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import SchoolRegistrationModal from "./school-registration-form";

type School = {
  name: string;
  nappsVerificationStatus: string;
};

const statusStyle = (s: string) =>
  s === "verified"
    ? "bg-green-100 text-green-700"
    : s === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

export default function DashboardClient({
  userEmail,
  school,
}: {
  userEmail: string;
  school: School | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setModalOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {modalOpen && (
        <SchoolRegistrationModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

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
          <span className="text-sm text-gray-500 hidden sm:block">
            {userEmail}
          </span>
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
            <Link
              href="/dashboard"
              title="Dashboard"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome{school ? `, ${school.name}` : ""}
          </h1>

          {!school && (
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
          )}
        </main>
      </div>
    </div>
  );
}
