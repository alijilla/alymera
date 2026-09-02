import { SidebarLayout } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="bg-card">
    <SidebarLayout>
      {children}
    </SidebarLayout>
    </body>

  );
}