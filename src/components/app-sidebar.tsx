import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  IdCard,
  Bell,
  Settings,
  School,
  BookOpen,
  Home,
  ChevronRight,
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
import { useRole, type Role } from "@/lib/role-context";

const navConfig: Record<
  Role,
  {
    label: string;
    sublabel: string;
    icon: React.ElementType;
    main: { title: string; url: string; icon: React.ElementType }[];
    tools: { title: string; url: string; icon: React.ElementType }[];
  }
> = {
  principal: {
    label: "Principal",
    sublabel: "Registrar · St. Mary's Academy",
    icon: School,
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Students", url: "/students", icon: Users },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Grades", url: "/grades", icon: GraduationCap },
    ],
    tools: [
      { title: "ID Cards", url: "/id-cards", icon: IdCard },
      { title: "Alerts", url: "/alerts", icon: Bell },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
  teacher: {
    label: "Teacher",
    sublabel: "Ms. Aurora Aquino · Grade 7",
    icon: BookOpen,
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Students", url: "/students", icon: Users },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Grades", url: "/grades", icon: GraduationCap },
    ],
    tools: [
      { title: "ID Cards", url: "/id-cards", icon: IdCard },
      { title: "Alerts", url: "/alerts", icon: Bell },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
  student: {
    label: "Student",
    sublabel: "Juan M. Dela Cruz · Grade 7",
    icon: Users,
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Grades", url: "/grades", icon: GraduationCap },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Notifications", url: "/alerts", icon: Bell },
    ],
    tools: [
      { title: "My ID Card", url: "/id-cards", icon: IdCard },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
};

const roleGradients: Record<Role, string> = {
  principal: "var(--gradient-primary)",
  teacher: "var(--gradient-accent)",
  student: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useRole();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const nav = navConfig[role];

  const isActive = (url: string) => {
    if (url === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* ── Logo ── */}
      <SidebarHeader className="border-b border-sidebar-border/40 pb-0">
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
              alt="EduCard Pro"
              className="h-9 max-w-[140px] object-contain"
            />
          )}
        </div>

        {/* Role identity card — clicking takes you to landing to switch */}
        <Link to="/" title="Switch role">
          {collapsed ? (
            <div
              className="mx-2 mb-3 flex items-center justify-center rounded-lg p-2 text-primary-foreground"
              style={{ background: roleGradients[role] }}
            >
              <nav.icon className="h-4 w-4" />
            </div>
          ) : (
            <div
              className="group mx-2 mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: roleGradients[role] }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/20">
                  <nav.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-ui text-[11px] font-semibold uppercase tracking-widest">
                    {nav.label}
                  </p>
                  <p className="truncate text-[10px] opacity-75">{nav.sublabel}</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-ui uppercase tracking-widest">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.main.map((item) => (
                <SidebarMenuItem key={item.url + item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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
              {nav.tools.map((item) => (
                <SidebarMenuItem key={item.url + item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-ui text-[11px] uppercase tracking-widest text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            Switch Role / Landing
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center justify-center rounded-lg py-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
