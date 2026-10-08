import { SidebarProvider } from "@/components/ui/sidebar";
import { TypeLayout } from "@/types";

const Layout = ({ children }: TypeLayout) => {
  return (
    <SidebarProvider className="h-svh overflow-hidden">{children}</SidebarProvider>
  );
};
export default Layout;