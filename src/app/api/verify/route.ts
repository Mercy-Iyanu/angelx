import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import VerificationToken from '@/models/VerificationToken'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  await connectDB()

  const record = await VerificationToken.findOne({ token })

  if (!record) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  await User.findByIdAndUpdate(record.userId, { emailVerified: true })
  await VerificationToken.deleteOne({ _id: record._id })

  return NextResponse.redirect(new URL('/verified', req.nextUrl))
}
