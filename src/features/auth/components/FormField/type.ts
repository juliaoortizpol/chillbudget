import { type InputHTMLAttributes, type ReactNode } from "react"

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
}
