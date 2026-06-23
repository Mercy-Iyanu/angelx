import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import School from '@/models/School'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
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

  return (
    <DashboardClient
      userEmail={user.email as string}
      school={
        school
          ? {
              name: school.name as string,
              nappsVerificationStatus: school.nappsVerificationStatus as string,
            }
          : null
      }
    />
  )
}
