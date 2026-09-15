import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import School from "@/models/School";

// Public page — intentionally outside /dashboard, so src/proxy.ts's matcher
// (protectedRoutes = ['/dashboard']) never gates it. Anyone with the reference
// number or QR (e.g. a school admitting a transferring pupil) can verify a TC's
// authenticity here, without logging in. Balance is never shown — that's only
// available to logged-in, NAPPS-verified schools via /dashboard/search.
function formatDate(date: Date) {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const statusStyle = (s: string) =>
  s === "Active"
    ? "bg-green-100 text-green-700"
    : s === "Exited-Cleared"
      ? "bg-gray-100 text-gray-600"
      : s === "Exited-Unresolved"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

export default async function VerifyTcPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  await connectDB();

  const student = await Student.findOne({ tcCertificateNumber: reference })
    .select("firstName lastName classLevel admissionStatus tcIssuedAt schoolId")
    .lean();

  const school = student
    ? await School.findById(student.schoolId).select("name").lean()
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Transfer Certificate Verification
        </p>
        <p className="text-sm text-gray-500 mb-6 break-all">{reference}</p>

        {student ? (
          <>
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 mb-5">
              <p className="text-sm font-medium text-green-800">
                Valid Transfer Certificate
              </p>
            </div>
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Pupil
                </dt>
                <dd className="text-sm text-gray-900">
                  {student.firstName as string} {student.lastName as string}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  School
                </dt>
                <dd className="text-sm text-gray-900">
                  {(school?.name as string) ?? "Unknown school"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Class at exit
                </dt>
                <dd className="text-sm text-gray-900">{student.classLevel as string}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </dt>
                <dd>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(student.admissionStatus as string)}`}
                  >
                    {student.admissionStatus as string}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Issued
                </dt>
                <dd className="text-sm text-gray-900">
                  {student.tcIssuedAt ? formatDate(student.tcIssuedAt as Date) : "—"}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-medium text-red-800">
              No Transfer Certificate found for this reference
            </p>
            <p className="text-xs text-red-700 mt-1">
              Double-check the reference number, or contact the issuing school.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex mt-8 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          AngelX Transfer Certificate Registry
        </Link>
      </div>
    </div>
  );
}
