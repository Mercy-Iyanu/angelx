import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import VerificationToken from '@/models/VerificationToken'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/signup?error=invalid-token')
  }

  await connectDB()

  const record = await VerificationToken.findOne({ token })

  if (!record) {
    redirect('/signup?error=invalid-token')
  }

  if (record.expiresAt < new Date()) {
    await VerificationToken.deleteOne({ _id: record._id })
    redirect('/signup?error=expired-token')
  }

  await User.findByIdAndUpdate(record.userId, { emailVerified: new Date() })
  await VerificationToken.deleteOne({ _id: record._id })

  redirect('/verified')
}
