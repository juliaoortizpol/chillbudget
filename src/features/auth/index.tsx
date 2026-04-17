import { LoginForm } from "./components/LoginForm"

function LoginPage() {
  const styles = {
    main: "min-h-screen flex items-center justify-center bg-ds-background px-4",
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
          <div className={styles.logoContainer}>
            <div className={styles.logoBox}>
              <svg viewBox="0 0 24 24" className={styles.logoIcon} aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className={styles.logoText}>FlowBudget</span>
          </div>

          {/* Heading */}
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Login to your financial sanctuary</p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          © {new Date().getFullYear()} FlowBudget · Personal Finance App
        </p>
      </div>
    </main>
  )
}

export { LoginPage }
