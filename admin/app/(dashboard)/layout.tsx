import { UserButton } from "@clerk/nextjs";
import { AdminGate } from "@/components/admin-gate";
import { AppSidebar } from "@/components/app-sidebar";
import { NewOrderNotifier } from "@/components/new-order-notifier";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <AdminGate>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <span className="text-sm font-medium text-muted-foreground">
              Admin
            </span>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <UserButton />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
        <NewOrderNotifier />
      </SidebarProvider>
    </AdminGate>
  );
}
