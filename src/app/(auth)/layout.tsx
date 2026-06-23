export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-sm">
        {children}
      </div>
    </main>
  )
}
