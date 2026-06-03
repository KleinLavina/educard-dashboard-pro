import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  IdCard,
  Bell,
  BellRing,
  Settings,
  School,
  BookOpen,
  ChevronDown,
  FileEdit,
  UserPlus,
  FileBarChart,
  Phone,
  LogOut,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
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

const roleGradients: Record<Role, string> = {
  admin:    "var(--gradient-primary)",
  teacher:  "var(--gradient-accent)",
  parent:   "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))",
  student:  "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))",
};

const roleLabels: Record<Role, { label: string; icon: React.ElementType; staticSuffix: string }> = {
  admin:   { label: "Admin",   icon: School,        staticSuffix: "St. Mary's Academy" },
  teacher: { label: "Teacher", icon: BookOpen,      staticSuffix: ""                   },
  parent:  { label: "Parent",  icon: Users,         staticSuffix: ""                   },
  student: { label: "Student", icon: GraduationCap, staticSuffix: ""                  },
};

function NavItem({ title, url, icon: Icon }: { title: string; url: string; icon: React.ElementType }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const active = url === "/dashboard" ? path === "/dashboard" : path.startsWith(url);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={title}>
        <Link to={url} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, setUserId } = useRole();

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    api.auth.me()
      .then((u) => setUserName(u.full_name))
      .catch(() => {});
  }, []);

  function handleSignOut() {
    toast.success("Signed out successfully", {
      description: "You have been logged out. See you next time!",
    });
    setUserId(null);
    // Small delay so the toast is visible before redirect
    setTimeout(() => {
      api.auth.logout();
    }, 800);
  }

  const [principalOpen, setPrincipalOpen] = useState(true);
  const [registrarOpen, setRegistrarOpen] = useState(true);

  const id = roleLabels[role];
  const gradient = roleGradients[role];

  const sublabel = (() => {
    const name = userName ?? "…";
    const suffix = id.staticSuffix;
    return suffix ? `${name} · ${suffix}` : name;
  })();

  return (
    <Sidebar collapsible="icon" className="border-r-0">

      {/* ── Logo + Role Identity Card ── */}
      <SidebarHeader className="border-b border-sidebar-border/40 pb-0">
        <div className="flex items-center justify-center gap-3 px-2 py-3">
          {collapsed ? (
            <img src="/Screenshot_2026-05-10_102005-removebg-preview.png" alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <img src="/Screenshot_2026-05-10_100606-removebg-preview.png" alt="EduCard Pro" className="h-9 max-w-[140px] object-contain" />
          )}
        </div>

        {/* Role identity badge — non-clickable, shows current user + role */}
        <div className="mx-2 mb-3">
          {collapsed ? (
            <div
              className="flex items-center justify-center rounded-xl p-2.5 text-primary-foreground shadow-sm"
              style={{ background: gradient }}
            >
              <id.icon className="h-4 w-4" />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-primary-foreground shadow-sm"
              style={{ background: gradient }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <id.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-widest">{id.label}</p>
                <p className="truncate text-[10px] opacity-75">{sublabel}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>

        {/* ── ADMIN: collapsible sections ── */}
        {role === "admin" && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Dashboard" url="/dashboard" icon={LayoutDashboard} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Collapsible open={principalOpen} onOpenChange={setPrincipalOpen} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 font-ui text-xs uppercase tracking-widest hover:bg-sidebar-accent transition-colors">
                    <span className="flex items-center gap-2"><School className="h-3.5 w-3.5" />Principal</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${principalOpen ? "" : "-rotate-90"}`} />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <NavItem title="All Students" url="/students"   icon={Users} />
                      <NavItem title="Attendance"   url="/attendance" icon={CalendarCheck} />
                      <NavItem title="Grades"       url="/grades"     icon={GraduationCap} />
                      <NavItem title="Reports"      url="/reports"    icon={FileBarChart} />
                      <NavItem title="Contacts"     url="/contacts"   icon={Phone} />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <Collapsible open={registrarOpen} onOpenChange={setRegistrarOpen} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 font-ui text-xs uppercase tracking-widest hover:bg-sidebar-accent transition-colors">
                    <span className="flex items-center gap-2"><FileEdit className="h-3.5 w-3.5" />Registrar</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${registrarOpen ? "" : "-rotate-90"}`} />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <NavItem title="ID Cards"   url="/id-cards" icon={IdCard} />
                      <NavItem title="Enrollment" url="/students" icon={UserPlus} />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Alerts"   url="/alerts"   icon={Bell} />
                  <NavItem title="Settings" url="/settings" icon={Settings} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* ── TEACHER ── */}
        {role === "teacher" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Dashboard"   url="/dashboard"  icon={LayoutDashboard} />
                  <NavItem title="My Students" url="/students"   icon={Users} />
                  <NavItem title="Attendance"  url="/attendance" icon={CalendarCheck} />
                  <NavItem title="Grades"      url="/grades"     icon={GraduationCap} />
                  <NavItem title="Reports"     url="/reports"    icon={FileBarChart} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Contacts" url="/contacts" icon={Phone} />
                  <NavItem title="ID Cards" url="/id-cards" icon={IdCard} />
                  <NavItem title="Alerts"   url="/alerts"   icon={Bell} />
                  <NavItem title="Settings" url="/settings" icon={Settings} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* ── PARENT ── */}
        {role === "parent" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Family</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Dashboard"   url="/dashboard"  icon={LayoutDashboard} />
                  <NavItem title="My Children" url="/students"   icon={Users} />
                  <NavItem title="Grades"      url="/grades"     icon={GraduationCap} />
                  <NavItem title="Attendance"  url="/attendance" icon={CalendarCheck} />
                  <NavItem title="Reports"     url="/reports"    icon={FileBarChart} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Contacts"      url="/contacts" icon={Phone} />
                  <NavItem title="ID Cards"      url="/id-cards" icon={IdCard} />
                  <NavItem title="Notifications" url="/alerts"   icon={BellRing} />
                  <NavItem title="Settings"      url="/settings" icon={Settings} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* ── STUDENT ── */}
        {role === "student" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Dashboard"     url="/dashboard" icon={LayoutDashboard} />
                  <NavItem title="My Grades"     url="/grades"    icon={GraduationCap} />
                  <NavItem title="Attendance"    url="/attendance" icon={CalendarCheck} />
                  <NavItem title="Notifications" url="/alerts"    icon={Bell} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="font-ui uppercase tracking-widest">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="My ID Card" url="/id-cards" icon={IdCard} />
                  <NavItem title="Settings"   url="/settings" icon={Settings} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

      </SidebarContent>

      {/* ── Footer — Sign Out only ── */}
      <SidebarFooter className="border-t border-sidebar-border/40">
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 font-ui text-[11px] uppercase tracking-widest text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground w-full ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
