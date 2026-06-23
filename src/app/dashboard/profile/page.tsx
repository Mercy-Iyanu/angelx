import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import School from '@/models/School'
import DashboardShell from '../shell'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId)
    .select('email role schoolId')
    .lean()
  if (!user) redirect('/login')

  const school = user.schoolId
    ? await School.findById(user.schoolId).lean()
    : null

  const shellSchool = school
    ? {
        name: school.name as string,
        nappsVerificationStatus: school.nappsVerificationStatus as string,
      }
    : null

  return (
    <DashboardShell userEmail={user.email as string} school={shellSchool}>
      <ProfileClient
        user={{ email: user.email as string, role: user.role as string }}
        school={
          school
            ? {
                name: school.name as string,
                nappsRegNumber: school.nappsRegNumber as string,
                schoolType: school.schoolType as string,
                yearEstablished: school.yearEstablished as number,
                studentPopulation: school.studentPopulation as number,
                lga: school.lga as string,
                town: school.town as string,
                address: school.address as string,
                phone: school.phone as string,
                proprietorName: school.proprietorName as string,
                proprietorPhone: school.proprietorPhone as string,
                nappsVerificationStatus: school.nappsVerificationStatus as string,
              }
            : null
        }
      />
    </DashboardShell>
  )
}
