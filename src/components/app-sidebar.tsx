import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  IdCard,
  Bell,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Grades", url: "/grades", icon: GraduationCap },
];

const toolItems = [
  { title: "ID Cards", url: "/id-cards", icon: IdCard },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className="flex items-center justify-center gap-3 px-2 py-3">
          {collapsed ? (
            <img
              src="/Screenshot_2026-05-10_102005-removebg-preview.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <img
              src="/Screenshot_2026-05-10_100606-removebg-preview.png"
              alt="School branding"
              className="h-9 max-w-[140px] object-contain"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-ui uppercase tracking-widest">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed && (
          <div className="px-2 py-2 font-ui text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
            SY 2025–2026 · v1.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
