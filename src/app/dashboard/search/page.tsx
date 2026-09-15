import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import School from '@/models/School'
import DashboardShell from '../shell'
import SearchClient from './search-client'
import { getRecentFeeStandingRequests } from '@/actions/crossSchool'

export default async function SearchPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('email schoolId').lean()
  if (!user) redirect('/login')

  const school = user.schoolId
    ? await School.findById(user.schoolId).select('name nappsVerificationStatus').lean()
    : null

  const shellSchool = school
    ? {
        name: school.name as string,
        nappsVerificationStatus: school.nappsVerificationStatus as string,
      }
    : null

  const verified = school?.nappsVerificationStatus === 'verified'
  const recentRequests = verified ? await getRecentFeeStandingRequests() : []

  return (
    <DashboardShell userEmail={user.email as string} school={shellSchool}>
      <SearchClient verified={verified} recentRequests={recentRequests} />
    </DashboardShell>
  )
}
