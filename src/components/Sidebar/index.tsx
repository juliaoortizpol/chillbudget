import { SidebarLogo } from "./SidebarLogo";
import { SidebarNav } from "./SidebarNav";
import { SidebarProfile } from "./SidebarProfile";

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col hidden md:flex shrink-0 sticky top-0">
      <SidebarLogo />
      <SidebarNav />
      <SidebarProfile />
    </aside>
  );
}
