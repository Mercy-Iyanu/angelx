export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 px-8 py-10 text-center">
          {/* Checkmark icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-zinc-900 mb-2">Email verified</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Your email address has been successfully verified. You can now sign in to your AngelX account.
          </p>

          <a
            href="/login"
            className="mt-7 inline-block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
