import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import School from '@/models/School'
import Student from '@/models/Student'
import DashboardShell from './shell'
import DashboardContent from './dashboard-client'

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

  const schoolData = school
    ? {
        name: school.name as string,
        nappsVerificationStatus: school.nappsVerificationStatus as string,
      }
    : null

  let stats = { total: 0, active: 0, male: 0, female: 0, byClass: [] as { level: string; count: number }[] }

  if (user.schoolId) {
    const [agg] = await Student.aggregate([
      { $match: { schoolId: user.schoolId } },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$admissionStatus', 'Active'] }, 1, 0] } },
                male: { $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] } },
                female: { $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] } },
              },
            },
          ],
          byClass: [
            { $group: { _id: '$classLevel', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ])

    if (agg) {
      const ov = agg.overview?.[0] ?? {}
      stats = {
        total: ov.total ?? 0,
        active: ov.active ?? 0,
        male: ov.male ?? 0,
        female: ov.female ?? 0,
        byClass: (agg.byClass ?? []).map((b: { _id: string; count: number }) => ({
          level: b._id,
          count: b.count,
        })),
      }
    }
  }

  return (
    <DashboardShell userEmail={user.email as string} school={schoolData}>
      <DashboardContent school={schoolData} stats={stats} />
    </DashboardShell>
  )
}
