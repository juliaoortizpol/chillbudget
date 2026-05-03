import { SidebarNavItem } from "./SidebarNavItem";
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Flag, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  { icon: Wallet, label: "Accounts", href: "/accounts" },
  { icon: PieChart, label: "Budget", href: "/budget" },
  { icon: Flag, label: "Goals", href: "/goals" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <SidebarNavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={location.pathname === item.href || (location.pathname === '/' && item.href === '/dashboard')}
        />
      ))}
    </nav>
  );
}
