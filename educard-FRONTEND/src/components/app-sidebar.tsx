import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  UserCircle,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const navigate = useNavigate();

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
    setTimeout(() => {
      api.auth.logout();
    }, 800);
  }

  function goToProfile() {
    navigate({ to: "/settings" });
  }

  const [principalOpen, setPrincipalOpen] = useState(true);
  const [registrarOpen, setRegistrarOpen] = useState(true);

  const id = roleLabels[role];
  const gradient = roleGradients[role];

  const displayName = userName ?? "…";
  const sublabel = id.staticSuffix ? `${displayName} · ${id.staticSuffix}` : displayName;

  return (
    <Sidebar collapsible="icon" className="border-r-0">

      {/* ── Logo ── */}
      <SidebarHeader className="border-b border-sidebar-border/40 pb-0">
        <div className="flex items-center justify-center gap-3 px-2 py-3">
          {collapsed ? (
            <img
              src="/EDUCARDLOGO/NAKO.png"
              alt="EduCard Pro"
              className="h-14 w-14 object-contain"
            />
          ) : (
            <img
              src="/EDUCARDLOGO/BIGNAKO.png"
              alt="EduCard Pro"
              className="h-20 w-auto max-w-[200px] object-contain"
            />
          )}
        </div>

        {/* ── Role Identity Card ─────────────────────────────────────────────
            Expanded : full pill with icon + role label + name → click → /settings
            Collapsed: fixed 8×8 square icon button with tooltip → click → /settings
        ──────────────────────────────────────────────────────────────────── */}
        <div className={`mb-3 ${collapsed ? "flex justify-center px-1" : "mx-2"}`}>
          {collapsed ? (
            /* ── Collapsed: fixed square icon button + tooltip ── */
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={goToProfile}
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-75"
                    style={{ background: gradient }}
                    aria-label="Go to profile"
                  >
                    <id.icon className="h-4 w-4 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-0.5">
                  <span className="font-semibold capitalize">{id.label}</span>
                  <span className="text-xs text-muted-foreground">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground">Click to view profile</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            /* ── Expanded: full pill ── */
            <button
              type="button"
              onClick={goToProfile}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-75"
              style={{ background: gradient }}
              aria-label="Go to profile"
            >
              {/* Role icon circle */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <id.icon className="h-4 w-4" />
              </div>
              {/* Labels */}
              <div className="min-w-0 flex-1 text-left">
                <p className="font-ui text-[10px] font-bold uppercase tracking-widest leading-tight">
                  {id.label}
                </p>
                <p className="truncate text-[11px] leading-tight opacity-80">{sublabel}</p>
              </div>
              {/* Profile hint icon */}
              <UserCircle className="h-4 w-4 shrink-0 opacity-60" />
            </button>
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
