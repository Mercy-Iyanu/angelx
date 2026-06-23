import Link from 'next/link'

export default function VerifiedPage() {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Email verified
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Your email address has been verified. You can now sign in.
      </p>
      <Link
        href="/login"
        className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Go to sign in
      </Link>
    </div>
  )
}
