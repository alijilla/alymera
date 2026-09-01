import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 border-r bg-muted/40 p-6 flex flex-col gap-4">
        <div className="font-bold text-xl mb-6 tracking-tight">ALYMERA</div>
        
        <nav className="flex flex-col gap-2">
          <Link href="/build" className="text-sm font-medium hover:text-primary transition-colors">
            💻 Build Mode
          </Link>
          <Link href="/career" className="text-sm font-medium hover:text-primary transition-colors">
            🎯 Career Mode
          </Link>
          <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors mt-8">
            ⚙️ Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}