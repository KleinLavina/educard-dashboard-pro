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

type Role = "principal" | "teacher" | "student";

function detectRole(path: string): Role {
  if (path.startsWith("/teacher")) return "teacher";
  if (path.startsWith("/student")) return "student";
  return "principal";
}

const navConfig: Record<
  Role,
  {
    label: string;
    icon: React.ElementType;
    main: { title: string; url: string; icon: React.ElementType }[];
    tools: { title: string; url: string; icon: React.ElementType }[];
  }
> = {
  principal: {
    label: "Principal / Registrar",
    icon: School,
    main: [
      { title: "Dashboard", url: "/principal", icon: LayoutDashboard },
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
    label: "Teacher Portal",
    icon: BookOpen,
    main: [
      { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
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
    label: "Student Portal",
    icon: Users,
    main: [
      { title: "Dashboard", url: "/student", icon: LayoutDashboard },
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

const roleSwitcher: { role: Role; label: string; url: string; icon: React.ElementType }[] = [
  { role: "principal", label: "Principal", url: "/principal", icon: School },
  { role: "teacher", label: "Teacher", url: "/teacher", icon: BookOpen },
  { role: "student", label: "Student", url: "/student", icon: Users },
];

const roleGradients: Record<Role, string> = {
  principal: "var(--gradient-primary)",
  teacher: "var(--gradient-accent)",
  student: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const role = detectRole(currentPath);
  const nav = navConfig[role];

  const isActive = (url: string) => {
    if (url === "/principal" || url === "/teacher" || url === "/student") {
      return currentPath === url;
    }
    return currentPath.startsWith(url);
  };

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

        {!collapsed && (
          <div
            className="mx-2 mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-primary-foreground"
            style={{ background: roleGradients[role] }}
          >
            <nav.icon className="h-4 w-4 shrink-0" />
            <span className="truncate font-ui text-[11px] uppercase tracking-wider">{nav.label}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-ui uppercase tracking-widest">
            {collapsed ? "Role" : "Navigate as"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roleSwitcher.map((r) => (
                <SidebarMenuItem key={r.role}>
                  <SidebarMenuButton
                    asChild
                    isActive={role === r.role}
                    tooltip={r.label}
                  >
                    <Link to={r.url} className="flex items-center gap-2">
                      <r.icon className="h-4 w-4" />
                      <span>{r.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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

      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 px-2 py-2 font-ui text-[11px] uppercase tracking-widest text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            Back to Landing
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center justify-center py-2 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
