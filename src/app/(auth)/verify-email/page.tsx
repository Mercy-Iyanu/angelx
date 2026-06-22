export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-zinc-900 mb-2">Check your email</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            We sent a verification link to your email address. Click the link to activate your account.
          </p>

          <p className="mt-6 text-xs text-zinc-400">
            The link expires in 24 hours. Didn&apos;t receive it? Check your spam folder or{' '}
            <a href="/signup" className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
              try again
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
