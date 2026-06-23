"use client"

const ROLE_LABELS: Record<string, string> = {
  proprietor: "Proprietor",
  bursar: "Bursar",
  admin: "Admin",
  head_teacher: "Head Teacher",
}

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
}

type SchoolProfile = {
  name: string
  nappsRegNumber: string
  schoolType: string
  yearEstablished: number
  studentPopulation: number
  lga: string
  town: string
  address: string
  phone: string
  proprietorName: string
  proprietorPhone: string
  nappsVerificationStatus: string
}

type UserProfile = { email: string; role: string }

export default function ProfileClient({
  user,
  school,
}: {
  user: UserProfile
  school: SchoolProfile | null
}) {
  const status = school?.nappsVerificationStatus ?? "pending"

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

      {/* Account section */}
      <Section title="Account">
        <Row label="Email address" value={user.email} />
        <Row label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
      </Section>

      {school ? (
        <>
          {/* NAPPS status */}
          <Section title="NAPPS verification">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE.pending}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              {status === "pending" && (
                <p className="text-sm text-gray-500">
                  Under review by AngelX admin. This usually takes 1–3 business
                  days.
                </p>
              )}
              {status === "verified" && (
                <p className="text-sm text-gray-500">
                  Your school is verified and has full access to AngelX.
                </p>
              )}
              {status === "rejected" && (
                <p className="text-sm text-gray-500">
                  Verification was not approved. Contact support for assistance.
                </p>
              )}
            </div>
          </Section>

          {/* School information */}
          <Section title="School information">
            <Row label="School name" value={school.name} />
            <Row label="NAPPS registration number" value={school.nappsRegNumber} />
            <Row label="School type" value={school.schoolType} />
            <Row label="Year established" value={String(school.yearEstablished)} />
            <Row
              label="Student population"
              value={school.studentPopulation.toLocaleString()}
            />
          </Section>

          {/* Location */}
          <Section title="Location">
            <Row label="LGA" value={school.lga} />
            <Row label="Town / Area" value={school.town} />
            <Row label="Full address" value={school.address} />
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <Row label="School phone" value={school.phone} />
            <Row label="Proprietor name" value={school.proprietorName} />
            <Row label="Proprietor phone" value={school.proprietorPhone} />
          </Section>
        </>
      ) : (
        <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
          <p className="text-sm text-gray-500">
            No school registered yet.{" "}
            <a
              href="/dashboard"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to dashboard
            </a>{" "}
            to complete your school registration.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3.5 flex items-start gap-4">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  )
}
