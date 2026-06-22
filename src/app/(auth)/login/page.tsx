import LoginForm from './form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const { reset } = await searchParams

  return <LoginForm resetSuccess={reset === 'success'} />
}
