import { type FormEvent, useState } from "react"
import { type FormValues, type FormErrors } from "./type"
import { useNavigate } from "react-router-dom"
import { useLogin } from "../../hooks/useLogin"
import { useSignup } from "../../hooks/useSignup"
import { useGoogleLogin } from "../../hooks/useGoogleLogin"

function validate(values: FormValues, mode: "login" | "signup"): FormErrors {
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

  if (mode === "signup") {
    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password."
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match."
    }
  }

  return errors
}

export function useLoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [values, setValues] = useState<FormValues>({ email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  
  const { login, isLoading: isLoginLoading } = useLogin()
  const { signup, isLoading: isSignupLoading } = useSignup()
  const { loginWithGoogle } = useGoogleLogin()
  
  const isLoading = isLoginLoading || isSignupLoading
  const navigate = useNavigate()

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"))
    setErrors({})
  }

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(values, mode)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    try {
      if (mode === "login") {
        await login(values)
        navigate("/dashboard")
      } else {
        await signup(values)
        await login(values)
        navigate("/dashboard")
      }
    } catch (err: any) {
      setErrors({ form: err.message || (mode === "login" ? "Invalid credentials. Please check your email and password." : "Signup failed.") })
    }
  }

  const handleSocialLogin = (provider: "google" | "apple") => {
    if (provider === "google") {
      loginWithGoogle()
    } else {
      console.log(`Social login not implemented for: ${provider}`)
    }
  }

  return {
    mode,
    toggleMode,
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleSocialLogin,
  }
}
