import { type FormEvent, useState } from "react"
import { type FormValues, type FormErrors } from "./type"

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

export function useLoginForm() {
  const [values, setValues] = useState<FormValues>({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Login successful", values.email)
    } catch {
      setErrors({ form: "Invalid credentials. Please check your email and password." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: "google" | "apple") => {
    console.log(`Social login: ${provider}`)
  }

  return {
    values,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleSocialLogin,
  }
}
