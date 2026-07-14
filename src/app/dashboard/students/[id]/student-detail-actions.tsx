"use client"

import { useState } from "react"
import EditStatusModal from "./edit-status-modal"

export default function StudentDetailActions({
  studentId,
  admissionStatus,
  currentBalance,
}: {
  studentId: string
  admissionStatus: string
  currentBalance: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <EditStatusModal
          studentId={studentId}
          admissionStatus={admissionStatus}
          currentBalance={currentBalance}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Edit
      </button>
    </>
  )
}
