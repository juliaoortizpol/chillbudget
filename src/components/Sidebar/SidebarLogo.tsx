export function SidebarLogo() {
  return (
    <div className="flex items-center justify-center px-6 py-6 border-b border-border/40">
      {/* 
        This references the logo from the public directory.
        Make sure to place the logo.png in the 'public' folder.
      */}
      <img src="/logo.png" alt="Sanctuary Logo" className="h-16 object-contain" />
    </div>
  );
}
