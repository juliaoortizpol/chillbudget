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

    const styles = {
      container: "flex flex-col gap-1.5",
      header: "flex items-center justify-between",
      label: "text-sm font-medium text-ds-text-primary",
      inputWrapper: "relative",
      icon: "absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-secondary pointer-events-none",
      input: cn(
        "h-11 bg-ds-surface transition-colors",
        "focus-visible:border-ds-primary focus-visible:ring-2 focus-visible:ring-ds-primary/20",
        icon && "pl-10",
        isPassword && "pr-10",
        error && "border-ds-danger focus-visible:border-ds-danger focus-visible:ring-ds-danger/20",
        className,
      ),
      toggleBtn: "absolute right-3 top-1/2 -translate-y-1/2 text-ds-text-secondary hover:text-ds-text-primary transition-colors",
      errorMsg: "text-xs text-ds-danger font-medium",
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Label htmlFor={id} className={styles.label}>
            {label}
          </Label>
          {rightSlot}
        </div>

        <div className={styles.inputWrapper}>
          {icon && (
            <span className={styles.icon}>
              {icon}
            </span>
          )}

          <Input
            ref={ref}
            id={id}
            type={resolvedType}
            aria-invalid={!!error}
            className={styles.input}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.toggleBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <p className={styles.errorMsg} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"

export { FormField }
