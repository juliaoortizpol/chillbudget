import { type ReactNode } from "react"

export interface SocialLoginButtonProps {
  provider: "google" | "apple"
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
}
