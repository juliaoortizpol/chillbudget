import { SidebarNavItem } from "./SidebarNavItem";
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Flag, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", isActive: true },
  { icon: ArrowLeftRight, label: "Transactions" },
  { icon: Wallet, label: "Accounts" },
  { icon: PieChart, label: "Budget" },
  { icon: Flag, label: "Goals" },
  { icon: Settings, label: "Settings" },
];

export function SidebarNav() {
  return (
    <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <SidebarNavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
        />
      ))}
    </nav>
  );
}
