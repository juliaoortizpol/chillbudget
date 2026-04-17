import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, rightSlot, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </Label>
          {rightSlot}
        </div>

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}

          <Input
            ref={ref}
            id={id}
            type={resolvedType}
            aria-invalid={!!error}
            className={cn(
              "h-11 rounded-xl border-gray-200 bg-white text-sm transition-colors",
              "placeholder:text-gray-400",
              "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20",
              icon && "pl-10",
              isPassword && "pr-10",
              error && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"

export { FormField }
