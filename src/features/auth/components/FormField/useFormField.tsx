import { useState } from "react"

export function useFormField(type?: string) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

  const togglePassword = () => setShowPassword((v) => !v)

  return {
    isPassword,
    showPassword,
    resolvedType,
    togglePassword,
  }
}
