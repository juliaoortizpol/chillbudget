import { type FormEvent, useState } from "react"
import { Mail, Lock, AlertCircle, ShieldCheck, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { SocialLoginButton } from "./SocialLoginButton"

interface FormValues {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.email.trim()) {
    errors.email = "Email is required."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Password is required."
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  return errors
}

function LoginForm() {
  const [values, setValues] = useState<FormValues>({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear field error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      // Simulate API call — replace with real auth logic
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // On success: redirect or update auth state
      console.log("Login successful", values.email)
    } catch {
      setErrors({ form: "Invalid credentials. Please check your email and password." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: "google" | "apple") => {
    // Placeholder — wire up OAuth flow here
    console.log(`Social login: ${provider}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Form-level error banner */}
      {errors.form && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600">Invalid credentials</p>
            <p className="text-xs text-red-500 mt-0.5">{errors.form}</p>
          </div>
        </div>
      )}

      {/* Fields */}
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
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Forgot password?
          </a>
        }
      />

      {/* Primary CTA */}
      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        className="h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Log in"
        )}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social buttons */}
      <div className="flex gap-3">
        <SocialLoginButton provider="google" onClick={() => handleSocialLogin("google")} disabled={isLoading} />
        <SocialLoginButton provider="apple" onClick={() => handleSocialLogin("apple")} disabled={isLoading} />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Sign up
        </a>
      </p>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck size={13} />
          256-bit encryption
        </span>
        <span className="text-gray-200">·</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Landmark size={13} />
          FDIC insured
        </span>
      </div>
    </form>
  )
}

export { LoginForm }
