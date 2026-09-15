'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'
import User from '@/models/User'
import School from '@/models/School'
import FeeStandingRequest from '@/models/FeeStandingRequest'
import { getSession } from '@/lib/auth'
import { scorePupilMatch, MIN_MATCH_SCORE } from '@/lib/match-score'
import { sendFeeStandingAlertEmail } from '@/lib/email'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

type CallerContext =
  | { ok: true; userId: string; schoolId: string; schoolName: string }
  | { ok: false; message: string }

// Every cross-school action funnels through here: re-derives the caller's own
// school from the session (never trusts client input for tenant identity, same
// convention as src/actions/student.ts), and additionally requires NAPPS
// verification — the first real enforcement of that field anywhere in the app,
// since this is the first feature that exposes another school's balance data.
async function getVerifiedCaller(): Promise<CallerContext> {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) {
    return { ok: false, message: 'You must register a school before using cross-school search.' }
  }

  const school = await School.findById(user.schoolId).select('name nappsVerificationStatus').lean()
  if (!school || school.nappsVerificationStatus !== 'verified') {
    return {
      ok: false,
      message: 'Cross-school search is only available to NAPPS-verified schools.',
    }
  }

  return {
    ok: true,
    userId: session.userId,
    schoolId: user.schoolId.toString(),
    schoolName: school.name as string,
  }
}

export type CrossSchoolMatch = {
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  classLevel: string
  schoolId: string
  schoolName: string
  admissionStatus: string
  matchScore: number
}

export type SearchState =
  | { success?: boolean; message?: string; results?: CrossSchoolMatch[] }
  | undefined

// Search results deliberately carry identity + status only (name, class, school,
// admission status, match score) — never balance/parent contact info. That's
// revealed only via requestFeeStandingReport below, which is the action that
// gets logged.
export async function searchEnrollment(
  _prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const caller = await getVerifiedCaller()
  if (!caller.ok) return { message: caller.message }

  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const dateOfBirth = (formData.get('dateOfBirth') as string)?.trim() || undefined
  const parentPhone = (formData.get('parentPhone') as string)?.trim() || undefined

  if (!firstName || !lastName) {
    return { message: 'Enter at least a first and last name to search.' }
  }

  const escapedLastName = lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Bounded pre-filter (lastName prefix, excluding the caller's own school) so
  // scoring happens in JS over a small candidate set, not the whole collection.
  const candidates = await Student.find({
    schoolId: { $ne: caller.schoolId },
    lastName: new RegExp(`^${escapedLastName}`, 'i'),
  })
    .select('firstName lastName dateOfBirth classLevel schoolId admissionStatus parentPhone')
    .limit(200)
    .lean()

  if (candidates.length === 0) {
    return { success: true, results: [] }
  }

  const schoolIds = [...new Set(candidates.map((c) => c.schoolId.toString()))]
  const schools = await School.find({ _id: { $in: schoolIds } }).select('name').lean()
  const schoolNameById = new Map(schools.map((s) => [s._id.toString(), s.name as string]))

  const results: CrossSchoolMatch[] = candidates
    .map((c) => ({
      c,
      matchScore: scorePupilMatch(
        { firstName, lastName, dateOfBirth, parentPhone },
        {
          firstName: c.firstName as string,
          lastName: c.lastName as string,
          dateOfBirth: c.dateOfBirth as Date,
          parentPhone: c.parentPhone as string | undefined,
        }
      ),
    }))
    .filter(({ matchScore }) => matchScore >= MIN_MATCH_SCORE)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20)
    .map(({ c, matchScore }) => ({
      studentId: c._id.toString(),
      firstName: c.firstName as string,
      lastName: c.lastName as string,
      dateOfBirth: (c.dateOfBirth as Date).toISOString(),
      classLevel: c.classLevel as string,
      schoolId: c.schoolId.toString(),
      schoolName: schoolNameById.get(c.schoolId.toString()) ?? 'Unknown school',
      admissionStatus: c.admissionStatus as string,
      matchScore,
    }))

  return { success: true, results }
}

export type FeeStandingResult = {
  studentId: string
  studentName: string
  schoolName: string
  classLevel: string
  admissionStatus: string
  currentBalance: number
  exitNotes: string
  tcCertificateNumber: string
}

export type FeeStandingState =
  | { success?: boolean; message?: string; result?: FeeStandingResult }
  | undefined

// Auto-discloses the target's fee standing immediately (MVP decision — no
// approval step) but logs every disclosure as a FeeStandingRequest audit
// record, and nudges the parent by email if a balance is outstanding.
export async function requestFeeStandingReport(
  studentId: string,
  matchScore: number
): Promise<FeeStandingState> {
  const caller = await getVerifiedCaller()
  if (!caller.ok) return { message: caller.message }

  const target = await Student.findById(studentId)
  if (!target) return { message: 'Student record not found.' }

  if (target.schoolId.toString() === caller.schoolId) {
    return { message: 'This student is already enrolled at your school.' }
  }

  const targetSchool = await School.findById(target.schoolId).select('name').lean()
  const schoolName = (targetSchool?.name as string) ?? 'Unknown school'
  const studentName = `${target.firstName} ${target.lastName}`

  await FeeStandingRequest.create({
    requestingSchoolId: caller.schoolId,
    requestingUserId: caller.userId,
    targetStudentId: target._id,
    targetSchoolId: target.schoolId,
    pupilNameSnapshot: studentName,
    matchScore,
    resultSnapshot: {
      admissionStatus: target.admissionStatus,
      currentBalance: target.currentBalance,
      exitNotes: target.exitNotes ?? '',
      classLevel: target.classLevel,
      schoolName,
    },
    status: 'fulfilled',
  })

  if (target.currentBalance > 0 && target.parentEmail) {
    try {
      await sendFeeStandingAlertEmail(target.parentEmail, {
        studentName,
        schoolName,
        requestingSchoolName: caller.schoolName,
        balance: formatNaira(target.currentBalance),
      })
    } catch (e) {
      // Non-fatal — the report was still fulfilled, mirrors emailBalanceInvoice's
      // error handling in src/actions/student.ts.
      console.error('Fee standing alert email failed:', e)
    }
  }

  revalidatePath('/dashboard/search')

  return {
    success: true,
    result: {
      studentId: target._id.toString(),
      studentName,
      schoolName,
      classLevel: target.classLevel,
      admissionStatus: target.admissionStatus,
      currentBalance: target.currentBalance,
      exitNotes: target.exitNotes ?? '',
      tcCertificateNumber: target.tcCertificateNumber ?? '',
    },
  }
}

export type RecentRequest = {
  id: string
  pupilName: string
  schoolName: string
  admissionStatus: string
  currentBalance: number
  matchScore: number
  createdAt: string
}

export async function getRecentFeeStandingRequests(): Promise<RecentRequest[]> {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) return []

  const requests = await FeeStandingRequest.find({ requestingSchoolId: user.schoolId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return requests.map((r) => ({
    id: r._id.toString(),
    pupilName: r.pupilNameSnapshot as string,
    schoolName: r.resultSnapshot.schoolName,
    admissionStatus: r.resultSnapshot.admissionStatus,
    currentBalance: r.resultSnapshot.currentBalance,
    matchScore: r.matchScore as number,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date().toISOString(),
  }))
}
