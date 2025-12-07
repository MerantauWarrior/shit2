"use client"

import * as React from "react"
import {
  Activity,
  Box,
  ChevronRight,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  LucideIcon,
  Package,
  Smartphone,
  Users,
  Warehouse
} from "lucide-react"
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {NavUser} from "@/components/nav-user";
import Link from "next/link";
import {usePathname} from "next/navigation";

// Memoized IconRenderer to prevent unnecessary re-renders
const IconRenderer = React.memo(({icon: Icon}: { icon?: LucideIcon }) =>
  Icon ? <Icon className="h-4 w-4"/> : null
);

const checkIsActive = (pathname: string, url: string | undefined): boolean =>
  pathname === url || (pathname.startsWith(`${url}/`) && url !== '/');

// Define types for navigation structure
type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type NavGroup = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

type NavSection = NavItem | NavGroup;

// This is sample data.
const data: {
  navMain: NavSection[];
  user: {
    name: string;
    email: string;
    avatar: string;
  };
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Monitoring",
      icon: Activity,
      items: [
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        {
          title: "Products",
          url: "/products",
          icon: Package,
        },
      ],
    },
    {
      title: "Warehouse",
      icon: Warehouse,
      items: [
        {
          title: "Devices",
          url: "/devices",
          icon: Smartphone,
        },
        {
          title: "Goods",
          url: "/goods",
          icon: Box,
        },
      ],
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

// Extracted component for collapsible menu items to prevent unnecessary re-renders
const CollapsibleMenuItem = React.memo(({
                                          section,
                                          pathname
                                        }: {
  section: NavGroup;
  pathname: string;
}) => {
  // Check if any child item is active
  const hasActiveChild = section.items.some(item => checkIsActive(pathname, item.url));

  return (
    <Collapsible
      key={section.title}
      defaultOpen
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={hasActiveChild}>
            <IconRenderer icon={section.icon}/>
            {section.title}
            <ChevronRight
              className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.items.map((menuItem) => {
              const isActive = checkIsActive(pathname, menuItem.url);
              return (
                <SidebarMenuSubItem key={menuItem.url || menuItem.title}>
                  <SidebarMenuSubButton asChild isActive={isActive} className={isActive ? "font-medium" : ""}>
                    <Link href={menuItem.url}>
                      <IconRenderer icon={menuItem.icon}/>
                      {menuItem.title}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
});

// Extracted component for simple menu items
const SimpleMenuItem = React.memo(({
                                     section,
                                     pathname
                                   }: {
  section: NavItem;
  pathname: string;
}) => {
  const isActive = checkIsActive(pathname, section.url);

  return (
    <SidebarMenuItem key={section.title}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={section.url}>
          <IconRenderer icon={section.icon}/>
          {section.title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden">
          <div
            className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4"/>
          </div>
          <div className="font-medium">Documentation</div>
        </div>
      </SidebarHeader>
      <SidebarSeparator/>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map(section => {
              return 'items' in section && section.items.length > 0 ? (
                <CollapsibleMenuItem
                  key={section.title}
                  section={section}
                  pathname={pathname}
                />
              ) : (
                <SimpleMenuItem
                  key={section.title}
                  section={section as NavItem}
                  pathname={pathname}
                />
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>


      {/*<SidebarContent className="gap-0">*/}
      {/*  {data.navMain.map((section) => {*/}
      {/*    const isActive = checkIsActive(pathname, section.url);*/}
      {/*    return !!section.items?.length ? (*/}
      {/*      <Collapsible*/}
      {/*        key={section.title}*/}
      {/*        title={section.title}*/}
      {/*        defaultOpen*/}
      {/*        className="group/collapsible"*/}
      {/*      >*/}
      {/*        <SidebarGroup>*/}
      {/*          <SidebarGroupLabel*/}
      {/*            asChild*/}
      {/*            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"*/}
      {/*          >*/}
      {/*            <CollapsibleTrigger>*/}
      {/*              <IconRenderer icon={section.icon}/>*/}
      {/*              {section.title}*/}
      {/*              <ChevronRight*/}
      {/*                className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/>*/}
      {/*            </CollapsibleTrigger>*/}
      {/*          </SidebarGroupLabel>*/}
      {/*          <CollapsibleContent>*/}
      {/*            <SidebarGroupContent>*/}
      {/*              <SidebarMenu>*/}
      {/*                {section.items.map((menuItem) => {*/}
      {/*                  const isActive = checkIsActive(pathname, menuItem.url);*/}
      {/*                  return (*/}
      {/*                    <SidebarMenuItem key={menuItem.title}>*/}
      {/*                      <SidebarMenuButton asChild isActive={isActive}>*/}
      {/*                        <Link href={menuItem.url} className={isActive ? 'active' : ''}>*/}
      {/*                          <IconRenderer icon={menuItem.icon}/>*/}
      {/*                          {menuItem.title}*/}
      {/*                        </Link>*/}
      {/*                      </SidebarMenuButton>*/}
      {/*                    </SidebarMenuItem>*/}
      {/*                  )*/}
      {/*                })}*/}
      {/*              </SidebarMenu>*/}
      {/*            </SidebarGroupContent>*/}
      {/*          </CollapsibleContent>*/}
      {/*        </SidebarGroup>*/}
      {/*      </Collapsible>*/}
      {/*    ) : (*/}
      {/*      <SidebarGroup>*/}
      {/*        <SidebarMenu>*/}
      {/*          <SidebarMenuItem>*/}
      {/*            <SidebarMenuButton asChild isActive={isActive}>*/}
      {/*              <Link href={section.url ?? "#"} className={isActive ? 'active' : ''}>*/}
      {/*                <IconRenderer icon={section.icon}/>*/}
      {/*                {section.title}*/}
      {/*              </Link>*/}
      {/*            </SidebarMenuButton>*/}
      {/*          </SidebarMenuItem>*/}
      {/*        </SidebarMenu>*/}
      {/*      </SidebarGroup>*/}
      {/*    )*/}
      {/*  })}*/}
      {/*</SidebarContent>*/}


      <SidebarFooter>
        <NavUser user={data.user}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}
