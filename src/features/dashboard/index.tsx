import { Sidebar } from "./components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* We will add AppBar here later as requested */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Content</h1>
        </div>
      </main>
    </div>
  );
}
