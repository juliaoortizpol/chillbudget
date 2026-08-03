import type { ElementType } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Link } from "react-router-dom";

interface SidebarNavItemProps {
  icon: ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export function SidebarNavItem({ icon: Icon, label, href, isActive }: SidebarNavItemProps) {
  return (
    <Link
      to={href}
      className={twMerge(
        clsx(
          "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary font-bold"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
