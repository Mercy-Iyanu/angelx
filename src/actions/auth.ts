'use server'

import { redirect } from 'next/navigation'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'
import { hashPassword, verifyPassword, setSessionCookie } from '@/lib/auth'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'
import PasswordResetToken from '@/models/PasswordResetToken'

export type SignupState = {
  errors?: {
    email?: string
    password?: string
    tos?: string
    general?: string
  }
}

export async function createAccount(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const tos = formData.get('tos')

  const errors: NonNullable<SignupState['errors']> = {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (!tos) {
    errors.tos = 'You must agree to the Terms of Service.'
  }

  if (Object.keys(errors).length > 0) return { errors }

  try {
    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return { errors: { email: 'An account with this email already exists.' } }
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({ email: email.toLowerCase(), passwordHash })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await VerificationToken.create({ userId: user._id, token, expiresAt })

    await sendVerificationEmail(email, token)
  } catch {
    return { errors: { general: 'Something went wrong. Please try again.' } }
  }

  redirect('/verify-email')
}

export type SignInState = {
  errors?: {
    email?: string
    password?: string
    general?: string
  }
}

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  const errors: NonNullable<SignInState['errors']> = {}

  if (!email) errors.email = 'Enter your email address.'
  if (!password) errors.password = 'Enter your password.'

  if (Object.keys(errors).length > 0) return { errors }

  try {
    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { errors: { general: 'Invalid email or password.' } }
    }

    if (!user.emailVerified) {
      return { errors: { general: 'Please verify your email before signing in.' } }
    }

    await setSessionCookie(user._id.toString())
  } catch {
    return { errors: { general: 'Something went wrong. Please try again.' } }
  }

  redirect('/dashboard')
}

export type ForgotPasswordState = {
  success?: boolean
  errors?: {
    email?: string
    general?: string
  }
}

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: 'Enter a valid email address.' } }
  }

  try {
    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      await PasswordResetToken.deleteMany({ userId: user._id })

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await PasswordResetToken.create({ userId: user._id, token, expiresAt })

      await sendPasswordResetEmail(email, token)
    }
    // Always return success to avoid revealing whether the email is registered
  } catch {
    return { errors: { general: 'Something went wrong. Please try again.' } }
  }

  return { success: true }
}

export type ResetPasswordState = {
  errors?: {
    password?: string
    confirm?: string
    general?: string
  }
}

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = (formData.get('token') as string | null) ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const confirm = (formData.get('confirm') as string | null) ?? ''

  const errors: NonNullable<ResetPasswordState['errors']> = {}

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (password !== confirm) {
    errors.confirm = 'Passwords do not match.'
  }

  if (Object.keys(errors).length > 0) return { errors }

  try {
    await connectDB()

    const record = await PasswordResetToken.findOne({ token })

    if (!record || record.expiresAt < new Date()) {
      if (record) await PasswordResetToken.deleteOne({ _id: record._id })
      return {
        errors: {
          general: 'This reset link is invalid or has expired. Please request a new one.',
        },
      }
    }

    const passwordHash = await hashPassword(password)
    await User.findByIdAndUpdate(record.userId, { passwordHash })
    await PasswordResetToken.deleteOne({ _id: record._id })
  } catch {
    return { errors: { general: 'Something went wrong. Please try again.' } }
  }

  redirect('/login?reset=success')
}
