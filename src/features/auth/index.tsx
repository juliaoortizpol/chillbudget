import { LoginForm } from "./components/LoginForm"

function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 px-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-indigo-100/40 px-8 py-9">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">FlowBudget</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Login to your financial sanctuary</p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} FlowBudget · Personal Finance App
        </p>
      </div>
    </main>
  )
}

export { LoginPage }
