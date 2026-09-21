
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardSidebar } from "@/components/dashboard-side-bar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 shrink-0">
          <SidebarTrigger className="h-7 w-7" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;