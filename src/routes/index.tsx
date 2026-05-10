import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap,
  IdCard,
  CalendarCheck,
  Bell,
  QrCode,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  School,
  BookOpen,
  Star,
  CheckCircle2,
  Smartphone,
  Printer,
} from "lucide-react";
import { useRole, type Role } from "@/lib/role-context";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "EduCard Pro — School Management & ID System" },
      {
        name: "description",
        content:
          "All-in-one platform: Grades, Attendance, ID Generation, Parent Notifications for Philippine K-12 schools.",
      },
    ],
  }),
});

const features = [
  {
    icon: GraduationCap,
    title: "Grade Management",
    desc: "Real-time grade entry with configurable formula engine. Bulk import via Excel/CSV. Instant parent alerts on new grades.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: CalendarCheck,
    title: "SF2 Attendance Tracking",
    desc: "USB barcode scanner or webcam scanning. Time-in/out logs per session. DepEd SF2-compliant reports generated automatically.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: IdCard,
    title: "Student ID System",
    desc: "Drag-and-drop template editor. CR-80 PVC card-ready print output at 300 DPI. Auto-queue on enrollment.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: Bell,
    title: "Parent Notifications",
    desc: "Free Facebook Messenger alerts via Meta Cloud API. SMS fallback via Semaphore. Instant scan-triggered messages.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
];

const pillars = [
  { icon: Shield, text: "Role-based access control" },
  { icon: BarChart3, text: "SF2-compliant analytics" },
  { icon: Smartphone, text: "Messenger & SMS alerts" },
  { icon: QrCode, text: "Barcode attendance scanning" },
  { icon: Printer, text: "PVC ID card printing" },
  { icon: School, text: "Multi-school / multi-tenant" },
];

const roles: {
  key: Role;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  gradient: string;
  items: string[];
}[] = [
  {
    key: "principal",
    title: "Principal / Registrar",
    subtitle: "School-wide overview",
    desc: "SF2 compliance dashboard, department analytics, flagged learners, section summaries, and registrar alerts — all in one view.",
    icon: School,
    gradient: "var(--gradient-primary)",
    items: ["Campus attendance overview", "SF2 compliance tracking", "Section & department stats", "Learner ID preview"],
  },
  {
    key: "teacher",
    title: "Teacher",
    subtitle: "Class management",
    desc: "Grade entry with formula engine, per-section attendance, class analytics, at-risk student flags, and bulk CSV import.",
    icon: BookOpen,
    gradient: "var(--gradient-accent)",
    items: ["Grade entry per subject", "Class attendance log", "At-risk student flags", "Bulk grade import"],
  },
  {
    key: "student",
    title: "Student / Parent",
    subtitle: "Personal portal",
    desc: "View real-time grades, attendance history, conduct log, Messenger notifications, and your personal learner ID card.",
    icon: Users,
    gradient: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))",
    items: ["Real-time grade viewing", "Attendance history", "Conduct log", "Learner ID card"],
  },
];

const stats = [
  { value: "300+", label: "Learners per campus" },
  { value: "₱0.50", label: "Per SMS notification" },
  { value: "CR-80", label: "PVC card-ready output" },
  { value: "SF2", label: "DepEd compliant reports" },
];

function LandingPage() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  function enterAs(role: Role) {
    setRole(role);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/Screenshot_2026-05-10_102005-removebg-preview.png"
              alt="EduCard Pro"
              className="h-8 w-8 object-contain"
            />
            <img
              src="/Screenshot_2026-05-10_100606-removebg-preview.png"
              alt="EduCard Pro"
              className="h-8 max-w-[120px] object-contain"
            />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#portals" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">Portals</a>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:block font-ui uppercase tracking-wider">Try demo:</span>
            <button
              onClick={() => enterAs("principal")}
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              Principal
            </button>
            <button
              onClick={() => enterAs("teacher")}
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              Teacher
            </button>
            <button
              onClick={() => enterAs("student")}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Student
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-ui text-[11px] uppercase tracking-widest text-primary-foreground/90">
            <Star className="h-3 w-3" /> Philippine K-12 School Management
          </span>
          <h1 className="mt-4 text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
            One Platform for Every<br className="hidden sm:block" /> School Need
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
            EduCard Pro consolidates grade management, barcode attendance tracking, student ID printing, and real-time parent notifications into a single, affordable system — DepEd-aligned and SF2-ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => enterAs("principal")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-lg transition-opacity hover:opacity-90"
            >
              <School className="h-4 w-4" /> Enter as Principal
            </button>
            <button
              onClick={() => enterAs("teacher")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-white/30"
            >
              <BookOpen className="h-4 w-4" /> Enter as Teacher
            </button>
            <button
              onClick={() => enterAs("student")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-white/30"
            >
              <Users className="h-4 w-4" /> Enter as Student
            </button>
          </div>
          <p className="mt-4 text-xs text-primary-foreground/60">Prototype demo — no login required</p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 font-ui text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Everything a School Needs</h2>
            <p className="mt-2 text-muted-foreground">Four pillars, one subscription — no extra software required.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${f.bg} ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities Pills ── */}
      <section className="bg-muted/40 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {pillars.map((p) => (
              <div
                key={p.text}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium"
              >
                <p.icon className="h-4 w-4 text-primary" />
                {p.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Portals ── */}
      <section id="portals" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Choose Your Portal</h2>
            <p className="mt-2 text-muted-foreground">Each role has a dedicated dashboard view tailored to their needs.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.key}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="px-5 py-6 text-primary-foreground" style={{ background: r.gradient }}>
                  <div className="mb-3 inline-flex rounded-xl bg-white/20 p-3">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{r.title}</h3>
                  <p className="text-sm opacity-80">{r.subtitle}</p>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => enterAs(r.key)}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors group-hover:bg-muted"
                  >
                    Enter Portal <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <img
                src="/Screenshot_2026-05-10_102005-removebg-preview.png"
                alt="EduCard Pro"
                className="h-6 w-6 object-contain"
              />
              <span className="font-ui text-xs uppercase tracking-widest text-muted-foreground">EduCard Pro</span>
            </div>
            <p className="font-ui text-[11px] uppercase tracking-wider text-muted-foreground">
              Aligned with DepEd SF1, SF2 &amp; LRN standards · Prototype — All data is for demonstration only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
