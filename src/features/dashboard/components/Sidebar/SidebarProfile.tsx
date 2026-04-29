export function SidebarProfile() {
  return (
    <div className="p-4 border-t border-border/40 mt-auto m-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
            alt="Alex Sterling" 
            className="w-full h-full object-cover bg-primary/10"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">Alex Sterling</span>
          <span className="text-xs text-muted-foreground">Premium Member</span>
        </div>
      </div>
    </div>
  );
}
