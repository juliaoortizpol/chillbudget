import { Mail, Lock, AlertCircle } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FormField } from "../FormField"
import { SocialLoginButton } from "../SocialLoginButton"
import { useLoginForm } from "./useLoginForm"

function LoginForm() {
  const { mode, toggleMode, values, errors, isLoading, handleChange, handleSubmit, handleSocialLogin } = useLoginForm()

  const styles = {
    header: "mb-7",
    title: "text-2xl font-heading font-bold text-ds-text-primary leading-tight",
    subtitle: "text-sm text-ds-text-secondary mt-1",
    form: "flex flex-col gap-5",
    errorBanner: "flex items-start gap-3 rounded-sm bg-ds-danger/10 border border-ds-danger/20 px-4 py-3",
    errorIcon: "text-ds-danger mt-0.5 shrink-0",
    errorTitle: "text-sm font-semibold text-ds-danger",
    errorText: "text-xs text-ds-danger mt-0.5",
    submitBtn: "btn-primary w-full h-11",
    loadingContent: "flex items-center gap-2",
    spinner: "animate-spin size-4",
    dividerContainer: "flex items-center gap-3",
    dividerLine: "flex-1 h-px bg-ds-border",
    dividerText: "text-xs text-ds-text-secondary font-medium uppercase tracking-wide",
    socialContainer: "flex gap-3",
    signupContainer: "text-center text-sm text-ds-text-secondary",
    signupLink: "font-semibold text-ds-primary hover:text-ds-primary-hover transition-colors",
  }

  return (
    <>
      {/* Heading */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {mode === "login" ? "Welcome back" : "Create your chillBudget account"}
        </h1>
        <p className={styles.subtitle}>
          {mode === "login" ? "Track your money. Plan with confidence. Chill." : "Start taking control of your money"}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        {errors.form && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <div>
              <p className={styles.errorTitle}>{mode === "login" ? "Invalid credentials" : "Error"}</p>
              <p className={styles.errorText}>{errors.form}</p>
            </div>
          </div>
        )}

        <FormField
          id="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="name@company.com"
          autoComplete={mode === "login" ? "username" : "email"}
          value={values.email}
          onChange={handleChange("email")}
          error={errors.email}
          icon={<Mail size={16} />}
        />

        <FormField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={values.password}
          onChange={handleChange("password")}
          error={errors.password}
          icon={<Lock size={16} />}
        />

        {mode === "signup" && (
          <FormField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirmPassword || ""}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            icon={<Lock size={16} />}
          />
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={styles.submitBtn}
        >
          {isLoading ? (
            <span className={styles.loadingContent}>
              <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {mode === "login" ? "Signing in…" : "Signing up…"}
            </span>
          ) : (
            mode === "login" ? "Log in" : "Sign up"
          )}
        </Button>

        <div className={styles.dividerContainer}>
          <Separator className="flex-1" />
          <span className={styles.dividerText}>
            {mode === "login" ? "or continue with" : "Or sign up with"}
          </span>
          <Separator className="flex-1" />
        </div>

      <div className={styles.socialContainer}>
        <SocialLoginButton provider="google" onClick={() => handleSocialLogin("google")} disabled={isLoading} />
      </div>

      <p className={styles.signupContainer}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <a href="#" className={styles.signupLink} onClick={(e) => { e.preventDefault(); toggleMode(); }}>
          {mode === "login" ? "Sign up" : "Log in"}
        </a>
      </p>
    </form>
    </>
  )
}

export { LoginForm }
