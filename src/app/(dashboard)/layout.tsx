import { SidebarLayout } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="">
    <SidebarLayout>
      {children}
    </SidebarLayout>
    </body>

  );
}