"use client"

import { useState } from "react"
import EditStudentModal, { type EditableStudent } from "./edit-student-modal"
import ExitClearanceModal from "./exit-clearance-modal"

export default function StudentDetailActions({
  studentId,
  studentName,
  admissionStatus,
  currentBalance,
  parentEmail,
  student,
}: {
  studentId: string
  studentName: string
  admissionStatus: string
  currentBalance: number
  parentEmail: string
  student: EditableStudent
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const canWithdraw = admissionStatus === "Active" || admissionStatus === "Suspended"

  return (
    <>
      {editOpen && (
        <EditStudentModal
          studentId={studentId}
          student={student}
          onClose={() => setEditOpen(false)}
        />
      )}
      {withdrawOpen && (
        <ExitClearanceModal
          studentId={studentId}
          studentName={studentName}
          currentBalance={currentBalance}
          parentEmail={parentEmail}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
      <div className="flex items-center gap-2">
        {canWithdraw && (
          <button
            onClick={() => setWithdrawOpen(true)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Withdraw student
          </button>
        )}
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
      </div>
    </>
  )
}
