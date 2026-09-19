import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: LayoutProps<"/">) => {
  return (
    <SidebarProvider className="h-svh overflow-hidden">{children}</SidebarProvider>
  );
};
export default Layout;