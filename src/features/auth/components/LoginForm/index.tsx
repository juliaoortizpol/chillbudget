import { Mail, Lock, AlertCircle, ShieldCheck, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FormField } from "../FormField"
import { SocialLoginButton } from "../SocialLoginButton"
import { useLoginForm } from "./useLoginForm"

function LoginForm() {
  const { values, errors, isLoading, handleChange, handleSubmit, handleSocialLogin } = useLoginForm()

  const styles = {
    form: "flex flex-col gap-5",
    errorBanner: "flex items-start gap-3 rounded-sm bg-ds-danger/10 border border-ds-danger/20 px-4 py-3",
    errorIcon: "text-ds-danger mt-0.5 shrink-0",
    errorTitle: "text-sm font-semibold text-ds-danger",
    errorText: "text-xs text-ds-danger mt-0.5",
    forgotPassword: "text-xs font-medium text-ds-primary hover:text-ds-primary-hover transition-colors",
    submitBtn: "btn-primary w-full h-11",
    loadingContent: "flex items-center gap-2",
    spinner: "animate-spin size-4",
    dividerContainer: "flex items-center gap-3",
    dividerLine: "flex-1 h-px bg-ds-border",
    dividerText: "text-xs text-ds-text-secondary font-medium uppercase tracking-wide",
    socialContainer: "flex gap-3",
    signupContainer: "text-center text-sm text-ds-text-secondary",
    signupLink: "font-semibold text-ds-primary hover:text-ds-primary-hover transition-colors",
    trustContainer: "flex items-center justify-center gap-4 pt-2",
    trustItem: "flex items-center gap-1.5 text-xs text-ds-text-secondary",
    trustDot: "text-ds-border",
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      {errors.form && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} className={styles.errorIcon} />
          <div>
            <p className={styles.errorTitle}>Invalid credentials</p>
            <p className={styles.errorText}>{errors.form}</p>
          </div>
        </div>
      )}

      <FormField
        id="email"
        label="Email address"
        type="email"
        placeholder="name@company.com"
        autoComplete="email"
        value={values.email}
        onChange={handleChange("email")}
        error={errors.email}
        icon={<Mail size={16} />}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
        icon={<Lock size={16} />}
        rightSlot={
          <a
            href="#"
            className={styles.forgotPassword}
          >
            Forgot password?
          </a>
        }
      />

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
            Signing in…
          </span>
        ) : (
          "Log in"
        )}
      </Button>

      <div className={styles.dividerContainer}>
        <Separator className="flex-1" />
        <span className={styles.dividerText}>or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className={styles.socialContainer}>
        <SocialLoginButton provider="google" onClick={() => handleSocialLogin("google")} disabled={isLoading} />
        <SocialLoginButton provider="apple" onClick={() => handleSocialLogin("apple")} disabled={isLoading} />
      </div>

      <p className={styles.signupContainer}>
        Don't have an account?{" "}
        <a href="#" className={styles.signupLink}>
          Sign up
        </a>
      </p>

      <div className={styles.trustContainer}>
        <span className={styles.trustItem}>
          <ShieldCheck size={13} />
          256-bit encryption
        </span>
        <span className={styles.trustDot}>·</span>
        <span className={styles.trustItem}>
          <Landmark size={13} />
          FDIC insured
        </span>
      </div>
    </form>
  )
}

export { LoginForm }
