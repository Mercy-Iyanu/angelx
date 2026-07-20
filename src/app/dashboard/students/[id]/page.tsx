import mongoose from "mongoose";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import School from "@/models/School";
import Student from "@/models/Student";
import DashboardShell from "../../shell";
import StudentDetailActions from "./student-detail-actions";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calculateAge(dob: Date) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatBalance(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const statusStyle = (s: string) =>
  s === "Active"
    ? "bg-green-100 text-green-700"
    : s === "Exited-Cleared"
      ? "bg-gray-100 text-gray-600"
      : s === "Exited-Unresolved"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectDB();

  const user = await User.findById(session.userId)
    .select("email schoolId")
    .lean();
  if (!user) redirect("/login");
  if (!user.schoolId) redirect("/dashboard/students");

  const school = await School.findById(user.schoolId)
    .select("name nappsVerificationStatus")
    .lean();

  const shellSchool = school
    ? {
        name: school.name as string,
        nappsVerificationStatus: school.nappsVerificationStatus as string,
      }
    : null;

  const student = await Student.findOne({
    _id: id,
    schoolId: user.schoolId,
  }).lean();
  if (!student) notFound();

  const dob = student.dateOfBirth as Date;
  const enrollmentDate = student.enrollmentDate as Date;

  return (
    <DashboardShell userEmail={user.email as string} school={shellSchool}>
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to students
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {student.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.photoUrl as string}
                alt=""
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(student.firstName as string, student.lastName as string)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {student.firstName as string} {student.lastName as string}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.classLevel as string}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(student.admissionStatus as string)}`}
            >
              {student.admissionStatus as string}
            </span>
            <StudentDetailActions
              studentId={id}
              studentName={`${student.firstName as string} ${student.lastName as string}`}
              admissionStatus={student.admissionStatus as string}
              currentBalance={student.currentBalance as number}
              parentEmail={(student.parentEmail as string) || ""}
              student={{
                firstName: student.firstName as string,
                lastName: student.lastName as string,
                dateOfBirth: dob.toISOString().split("T")[0],
                gender: student.gender as string,
                classLevel: student.classLevel as string,
                admissionNumber: (student.admissionNumber as string) || "",
                parentName: (student.parentName as string) || "",
                parentPhone: (student.parentPhone as string) || "",
                parentEmail: (student.parentEmail as string) || "",
                currentBalance: student.currentBalance as number,
                photoUrl: (student.photoUrl as string) || "",
              }}
            />
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">
          <Field
            label="Admission number"
            value={(student.admissionNumber as string) || "—"}
          />
          <Field label="Class level" value={student.classLevel as string} />
          <Field
            label="Gender"
            value={student.gender as string}
            className="capitalize"
          />
          <Field
            label="Date of birth"
            value={`${formatDate(dob)} (${calculateAge(dob)} yrs)`}
          />
          <Field
            label="Parent / Guardian"
            value={(student.parentName as string) || "—"}
          />
          <Field
            label="Parent / Guardian phone"
            value={(student.parentPhone as string) || "—"}
          />
          <Field
            label="Parent / Guardian email"
            value={(student.parentEmail as string) || "—"}
          />
          <Field label="Enrollment date" value={formatDate(enrollmentDate)} />
          <Field
            label="Amount Owed"
            value={formatBalance(student.currentBalance as number)}
            className={
              (student.currentBalance as number) > 0
                ? "text-red-600 font-medium"
                : ""
            }
          />
        </dl>

        {student.tcCertificateNumber && (
          <div className="mx-6 mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Transfer Certificate
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div>
                <dt className="text-xs text-gray-400">Certificate number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {student.tcCertificateNumber as string}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Issued</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(student.tcIssuedAt as Date)}
                </dd>
              </div>
            </div>
          </div>
        )}

        {student.admissionStatus === "Exited-Unresolved" &&
          student.exitNotes && (
            <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
                Exited without clearance
              </p>
              <p className="text-sm text-red-800">
                {student.exitNotes as string}
              </p>
            </div>
          )}
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className={`text-sm text-gray-900 ${className ?? ""}`}>{value}</dd>
    </div>
  );
}
