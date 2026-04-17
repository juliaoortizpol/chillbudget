import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSocialLoginButton } from "./useSocialLoginButton"
import { type SocialLoginButtonProps } from "./type"

function SocialLoginButton({ provider, onClick, disabled }: SocialLoginButtonProps) {
  const { label, icon } = useSocialLoginButton(provider)

  const styles = {
    button: cn(
      "h-11 flex-1 rounded-sm border border-ds-border bg-ds-surface text-sm font-medium text-ds-text-primary",
      "hover:bg-ds-background hover:border-ds-border transition-all",
      "focus-visible:ring-2 focus-visible:ring-ds-primary/20",
    ),
    content: "flex items-center gap-2"
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={styles.button}
      aria-label={`Continue with ${label}`}
    >
      <div className={styles.content}>
        {icon}
        <span>{label}</span>
      </div>
    </Button>
  )
}

export { SocialLoginButton }
