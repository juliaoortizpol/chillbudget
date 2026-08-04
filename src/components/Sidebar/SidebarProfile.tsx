import { useEffect } from "react"
import { UserRound } from "lucide-react"
import { useProfile } from "@/features/auth/hooks/useProfile"

export function SidebarProfile() {
  const { getProfile, profile, isLoading } = useProfile()

  useEffect(() => {
    void getProfile().catch(() => undefined)
  }, [getProfile])

  const email = profile?.email
  const initials = email?.slice(0, 2).toUpperCase()

  return (
    <div className="p-4 border-t border-border/40 mt-auto m-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-sm font-bold text-primary">
          {initials || <UserRound className="h-5 w-5" />}
        </div>
        <div className="flex min-w-0 flex-col">
          {isLoading ? (
            <>
              <span className="h-3 w-28 animate-pulse rounded bg-muted" />
              <span className="mt-2 h-2.5 w-16 animate-pulse rounded bg-muted" />
            </>
          ) : (
            <>
              <span className="truncate text-sm font-medium text-foreground" title={email || undefined}>
                {email || "Signed in user"}
              </span>
              <span className="text-xs text-muted-foreground">Account</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
