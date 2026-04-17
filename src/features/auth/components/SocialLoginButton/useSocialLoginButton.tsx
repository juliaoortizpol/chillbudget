import { type ReactNode } from "react"
import { type SocialLoginButtonProps } from "./type"
import { GoogleIcon, AppleIcon } from "@/components/icons"

const providerConfig: Record<SocialLoginButtonProps["provider"], { label: string; icon: ReactNode }> = {
  google: {
    label: "Google",
    icon: <GoogleIcon className="size-4" />,
  },
  apple: {
    label: "Apple",
    icon: <AppleIcon className="size-4 fill-current" />,
  },
}

export function useSocialLoginButton(provider: SocialLoginButtonProps["provider"]) {
  const config = providerConfig[provider]
  
  return {
    label: config.label,
    icon: config.icon,
  }
}
