import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import School from '@/models/School'
import Student from '@/models/Student'
import DashboardShell from '../shell'
import StudentsClient from './students-client'

export default async function StudentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('email schoolId').lean()
  if (!user) redirect('/login')

  const school = user.schoolId
    ? await School.findById(user.schoolId)
        .select('name nappsVerificationStatus')
        .lean()
    : null

  const shellSchool = school
    ? {
        name: school.name as string,
        nappsVerificationStatus: school.nappsVerificationStatus as string,
      }
    : null

  const students = user.schoolId
    ? await Student.find({ schoolId: user.schoolId })
        .select(
          'firstName lastName gender classLevel admissionNumber parentName enrollmentDate'
        )
        .sort({ lastName: 1, firstName: 1 })
        .lean()
    : []

  const serialized = students.map((s) => ({
    id: s._id.toString(),
    firstName: s.firstName as string,
    lastName: s.lastName as string,
    gender: s.gender as string,
    classLevel: s.classLevel as string,
    admissionNumber: (s.admissionNumber as string | undefined) ?? '',
    parentName: (s.parentName as string | undefined) ?? '',
    enrollmentDate:
      s.enrollmentDate instanceof Date
        ? s.enrollmentDate.toISOString()
        : new Date().toISOString(),
  }))

  return (
    <DashboardShell userEmail={user.email as string} school={shellSchool}>
      <StudentsClient students={serialized} hasSchool={!!school} />
    </DashboardShell>
  )
}
