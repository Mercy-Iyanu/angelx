"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SchoolRegistrationModal from "./school-registration-form"

type School = { name: string; nappsVerificationStatus: string }

export default function DashboardContent({ school }: { school: School | null }) {
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
    </>
  )
}
