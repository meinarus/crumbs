import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, adminNavItems } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarBreadcrumb } from "@/components/sidebar-breadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        businessName: session.user.businessName ?? null,
        image: session.user.image ?? null,
        role: session.user.role!,
      }
    : null;

  if (!user) return <>{children}</>;

  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} user={user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <SidebarBreadcrumb />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
