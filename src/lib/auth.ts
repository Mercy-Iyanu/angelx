import 'server-only'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const key = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE = 'session'
const DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export interface SessionPayload extends JWTPayload {
  userId: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })

    if (typeof payload.userId !== 'string') {
      return null
    }
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  const token = await encrypt({ userId })
  const expires = new Date(Date.now() + DURATION)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return decrypt(token)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}
