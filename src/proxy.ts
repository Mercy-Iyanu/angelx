import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/login', '/signup', '/verify-email', '/verified']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected = protectedRoutes.some((r) => path.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r))

  const token = req.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
