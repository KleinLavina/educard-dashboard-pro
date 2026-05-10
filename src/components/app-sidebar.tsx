import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
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
  ChevronDown,
  FileEdit,
  UserPlus,
  MessageCircle,
  BellRing,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  admin: {
    label: "Admin",
    sublabel: "Principal / Registrar · St. Mary's Academy",
    icon: School,
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Students", url: "/students", icon: Users },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Grades", url: "/grades", icon: GraduationCap },
      { title: "ID Cards", url: "/id-cards", icon: IdCard },
    ],
    tools: [
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
      { title: "Parent Contacts", url: "/contacts", icon: MessageCircle },
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
  parent: {
    label: "Parent",
    sublabel: "Maria Dela Cruz · 2 Children",
    icon: Users,
    main: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Children", url: "/students", icon: Users },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Grades", url: "/grades", icon: GraduationCap },
    ],
    tools: [
      { title: "Teacher Contacts", url: "/contacts", icon: MessageCircle },
      { title: "Notifications", url: "/alerts", icon: BellRing },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
};

const roleGradients: Record<Role, string> = {
  admin: "var(--gradient-primary)",
  teacher: "var(--gradient-accent)",
  student: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))",
  parent: "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useRole();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const nav = navConfig[role];

  // State for collapsible sections (Admin only)
  const [principalOpen, setPrincipalOpen] = useState(true);
  const [registrarOpen, setRegistrarOpen] = useState(true);

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
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>
        {role === "admin" ? (
          <>
            {/* Dashboard - Always visible */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Dashboard">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Principal Functions - Collapsible */}
            <Collapsible open={principalOpen} onOpenChange={setPrincipalOpen} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between font-ui uppercase tracking-widest hover:bg-sidebar-accent">
                    <span className="flex items-center gap-2">
                      <School className="h-3.5 w-3.5" />
                      Principal
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${principalOpen ? "" : "-rotate-90"}`} />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/students")} tooltip="All Students">
                          <Link to="/students" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>All Students</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/attendance")} tooltip="Attendance">
                          <Link to="/attendance" className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4" />
                            <span>Attendance</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/grades")} tooltip="Grades">
                          <Link to="/grades" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>Grades</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Registrar Functions - Collapsible */}
            <Collapsible open={registrarOpen} onOpenChange={setRegistrarOpen} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between font-ui uppercase tracking-widest hover:bg-sidebar-accent">
                    <span className="flex items-center gap-2">
                      <FileEdit className="h-3.5 w-3.5" />
                      Registrar
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${registrarOpen ? "" : "-rotate-90"}`} />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/id-cards")} tooltip="ID Cards">
                          <Link to="/id-cards" className="flex items-center gap-2">
                            <IdCard className="h-4 w-4" />
                            <span>ID Cards</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Enrollment">
                          <Link to="/students" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            <span>Enrollment</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Tools */}
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/alerts")} tooltip="Alerts">
                      <Link to="/alerts" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Alerts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <>
            {/* Teacher and Student - Regular navigation */}
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
          </>
        )}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-ui text-[11px] uppercase tracking-widest text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            Switch Role
          </Link>
        ) : (
          <Link
            to="/"
            title="Switch Role"
            className="flex items-center justify-center rounded-lg py-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
