import { LoginForm } from "./components/LoginForm"

function LoginPage() {
  const styles = {
    main: "min-h-[100dvh] flex items-start justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,_#DDF6F1_0%,_#F5FAF9_45%,_#EDF7FA_100%)] px-3 py-4 sm:items-center sm:px-4 sm:py-8",
    wrapper: "w-full max-w-[420px]",
    card: "card shadow-elevated px-5 py-6 sm:px-8 sm:py-8",
    logoContainer: "flex items-center gap-2.5 mb-8",
    logoBox: "size-9 rounded-sm bg-ds-primary flex items-center justify-center shadow-sm",
    logoIcon: "size-5 fill-white",
    logoText: "text-lg font-heading font-bold text-ds-text-primary tracking-tight",
    header: "mb-7",
    title: "text-2xl font-heading font-bold text-ds-text-primary leading-tight",
    subtitle: "text-sm text-ds-text-secondary mt-1",
    footer: "px-2 pb-2 text-center text-[11px] font-medium text-ds-text-secondary mt-4 sm:mt-6 sm:text-xs",
  }

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        {/* Card */}
        <div className={styles.card}>
          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-5">
            <img
              src="/chillbudget-logo.png"
              alt="chillBudget"
              className="h-32 w-auto max-w-full object-contain min-[390px]:h-36 sm:h-44 md:h-48"
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
