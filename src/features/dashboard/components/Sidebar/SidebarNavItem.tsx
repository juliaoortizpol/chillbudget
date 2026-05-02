import type { ElementType } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SidebarNavItemProps {
  icon: ElementType;
  label: string;
  isActive?: boolean;
}

export function SidebarNavItem({ icon: Icon, label, isActive }: SidebarNavItemProps) {
  return (
    <button
      className={twMerge(
        clsx(
          "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
