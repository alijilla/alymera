import { SidebarLayout } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main >
    <SidebarLayout >
      {children}
    </SidebarLayout>
    </main>

    
  );
}