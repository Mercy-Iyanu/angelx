'use server'

import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'
import PasswordResetToken from '@/models/PasswordResetToken'
import { createSession, deleteSession } from '@/lib/auth'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'

export type FormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        terms?: string[]
      }
      message?: string
    }
  | undefined

export async function signUp(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const terms = formData.get('terms')

  const errors: NonNullable<FormState>['errors'] = {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address.']
  }
  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters.']
  }
  if (!terms) {
    errors.terms = ['You must accept the terms of service.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const existing = await User.findOne({ email })
  if (existing) {
    return { errors: { email: ['An account with this email already exists.'] } }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash })

  const token = randomBytes(32).toString('hex')
  await VerificationToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  await sendVerificationEmail(email, token)

  redirect('/verify-email')
}

export async function signIn(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  const errors: NonNullable<FormState>['errors'] = {}

  if (!email) errors.email = ['Email is required.']
  if (!password) errors.password = ['Password is required.']

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const user = await User.findOne({ email })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { errors: { email: ['Invalid email or password.'] } }
  }

  if (!user.emailVerified) {
    return { errors: { email: ['Please verify your email before signing in.'] } }
  }

  await createSession(user._id.toString())
  redirect('/dashboard')
}

export async function signOut() {
  await deleteSession()
  redirect('/login')
}

export async function forgotPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ['Please enter a valid email address.'] } }
  }

  await connectDB()

  const user = await User.findOne({ email })

  if (user) {
    await PasswordResetToken.deleteMany({ userId: user._id })

    const token = randomBytes(32).toString('hex')
    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    })

    await sendPasswordResetEmail(email, token)
  }

  return {
    message:
      "If an account exists with that email, we've sent a password reset link.",
  }
}

export async function resetPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const errors: NonNullable<FormState>['errors'] = {}

  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters.']
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = ['Passwords do not match.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const record = await PasswordResetToken.findOne({ token })

  if (!record) {
    return { message: 'This reset link is invalid or has expired.' }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await User.findByIdAndUpdate(record.userId, { passwordHash })
  await PasswordResetToken.deleteOne({ _id: record._id })

  redirect('/login')
}
