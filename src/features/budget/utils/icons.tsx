import React from "react"
import { Car, Utensils, Tv, HeartPulse, Wallet, Box, Home } from "lucide-react"

export const iconMap: Record<string, React.ReactNode> = {
  car: <Car className="w-5 h-5" />,
  utensils: <Utensils className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  heart: <HeartPulse className="w-5 h-5" />,
  wallet: <Wallet className="w-5 h-5" />,
  housing: <Home className="w-5 h-5" />,
  default: <Box className="w-5 h-5" />,
}

export function getIcon(iconName: string | undefined) {
  if (!iconName) return iconMap.default;
  return iconMap[iconName.toLowerCase()] || iconMap.default;
}
