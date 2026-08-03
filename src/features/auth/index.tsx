import { LoginForm } from "./components/LoginForm"

function LoginPage() {
  const styles = {
    main: "min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#DDF6F1_0%,_#F5FAF9_45%,_#EDF7FA_100%)] px-4",
    wrapper: "w-full max-w-[420px]",
    card: "card shadow-elevated px-8 py-9",
    logoContainer: "flex items-center gap-2.5 mb-8",
    logoBox: "size-9 rounded-sm bg-ds-primary flex items-center justify-center shadow-sm",
    logoIcon: "size-5 fill-white",
    logoText: "text-lg font-heading font-bold text-ds-text-primary tracking-tight",
    header: "mb-7",
    title: "text-2xl font-heading font-bold text-ds-text-primary leading-tight",
    subtitle: "text-sm text-ds-text-secondary mt-1",
    footer: "text-center text-xs text-ds-text-secondary mt-6",
  }

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        {/* Card */}
        <div className={styles.card}>
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/chillbudget-logo.png"
              alt="chillBudget"
              className="h-48 w-auto max-w-full object-contain"
            />
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          © {new Date().getFullYear()} chillBudget · Track. Plan. Chill.
        </p>
      </div>
    </main>
  )
}

export { LoginPage }
export { OAuthCallback } from "./components/OAuthCallback"
