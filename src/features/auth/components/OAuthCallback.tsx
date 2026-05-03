import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      localStorage.setItem("jwt_token", token)
      navigate("/dashboard", { replace: true })
    } else {
      // If there's no token, redirect back to login
      navigate("/", { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-background">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin size-8 text-ds-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-ds-text-secondary text-sm font-medium">Completing login...</p>
      </div>
    </div>
  )
}
