import { redirect } from 'next/navigation'
import ResetPasswordForm from './form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    redirect('/forgot-password')
  }

  return <ResetPasswordForm token={token} />
}
