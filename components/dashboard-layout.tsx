import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen p-6 pt-20 md:ml-64 md:pt-6">{children}</main>
    </div>
  );
}