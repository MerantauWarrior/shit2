import {ReactNode} from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/breadcrumbs";
import {Notifications} from "@/components/notifications";

export default function DashboardLayout({children}: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="bg-background sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1"/>
          <Separator orientation="vertical" className="mr-2 h-4"/>
          <Breadcrumbs/>
          <Separator orientation="vertical" className="ml-auto mr-2 h-4"/>
          <Notifications/>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
