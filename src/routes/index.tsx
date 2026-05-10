import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertTriangle,
  Bell,
  QrCode,
  TrendingUp,
  School,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Principal's Portal — St. Mary's Academy (EduCard Pro)" },
      {
        name: "description",
        content:
          "Principal and Registrar overview of Junior and Senior High School departments, SF2 attendance, sections, and advisers.",
      },
    ],
  }),
});

// SF2 (DepEd School Form 2) target attendance rate
const SF2_TARGET = 95;

type Section = {
  name: string;
  adviser: string;
  enrolled: number;
  attendance: number; // %
};

type Department = {
  key: "JHS" | "SHS";
  label: string;
  caption: string;
  grades: { level: string; sections: Section[] }[];
};

const departments: Department[] = [
  {
    key: "JHS",
    label: "Junior High School",
    caption: "Grades 7 – 10",
    grades: [
      {
        level: "Grade 7",
        sections: [
          { name: "Sampaguita", adviser: "Ms. Aurora Aquino", enrolled: 42, attendance: 96.2 },
          { name: "Rosal", adviser: "Mr. Benjie Lopez", enrolled: 40, attendance: 93.1 },
        ],
      },
      {
        level: "Grade 8",
        sections: [
          { name: "Adelfa", adviser: "Ms. Carmela Cruz", enrolled: 41, attendance: 91.4 },
          { name: "Ilang-Ilang", adviser: "Mr. Dario Tan", enrolled: 39, attendance: 88.7 },
        ],
      },
      {
        level: "Grade 9",
        sections: [
          { name: "Rizal", adviser: "Ms. Elena Bautista", enrolled: 38, attendance: 89.5 },
          { name: "Bonifacio", adviser: "Mr. Felix Ramos", enrolled: 40, attendance: 84.2 },
        ],
      },
      {
        level: "Grade 10",
        sections: [
          { name: "Mabini", adviser: "Ms. Glenda Reyes", enrolled: 42, attendance: 95.6 },
          { name: "Del Pilar", adviser: "Mr. Hector Santos", enrolled: 41, attendance: 92.0 },
        ],
      },
    ],
  },
  {
    key: "SHS",
    label: "Senior High School",
    caption: "Grades 11 – 12 · Academic & TVL Tracks",
    grades: [
      {
        level: "Grade 11",
        sections: [
          { name: "St. Jude (STEM)", adviser: "Ms. Imelda Villanueva", enrolled: 36, attendance: 96.8 },
          { name: "St. Therese (ABM)", adviser: "Mr. Joel Mercado", enrolled: 34, attendance: 90.3 },
        ],
      },
      {
        level: "Grade 12",
        sections: [
          { name: "St. Ignatius (HUMSS)", adviser: "Ms. Karla Domingo", enrolled: 35, attendance: 87.4 },
          { name: "St. Francis (TVL-ICT)", adviser: "Mr. Lito Pascual", enrolled: 32, attendance: 94.1 },
        ],
      },
    ],
  },
];

// Aggregations
function deptStats(dept: Department) {
  const sections = dept.grades.flatMap((g) => g.sections);
  const enrolled = sections.reduce((a, s) => a + s.enrolled, 0);
  const present = sections.reduce(
    (a, s) => a + Math.round((s.attendance / 100) * s.enrolled),
    0,
  );
  const rate = (present / enrolled) * 100;
  const below = sections.filter((s) => s.attendance < SF2_TARGET).length;
  return { enrolled, present, rate, sections: sections.length, below };
}

const jhs = deptStats(departments[0]);
const shs = deptStats(departments[1]);
const totalEnrolled = jhs.enrolled + shs.enrolled;
const totalPresent = jhs.present + shs.present;
const totalBelow = jhs.below + shs.below;

const attendanceData = [
  { day: "Mon", value: 94 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 89 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 91 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 93 },
];

const flaggedLearners = [
  { lrn: "136728140987", name: "Juan Dela Cruz", section: "G9 Bonifacio", adviser: "Mr. Felix Ramos", rate: 78, status: "Below SF2" },
  { lrn: "136728140312", name: "Maria Santos", section: "G8 Ilang-Ilang", adviser: "Mr. Dario Tan", rate: 82, status: "Below SF2" },
  { lrn: "136728140211", name: "Jose Aguilar", section: "G12 St. Ignatius", adviser: "Ms. Karla Domingo", rate: 84, status: "Below SF2" },
  { lrn: "136728140145", name: "Andrea Mercado", section: "G10 Del Pilar", adviser: "Mr. Hector Santos", rate: 92, status: "On Track" },
  { lrn: "136728140098", name: "Marco Reyes", section: "G7 Rosal", adviser: "Mr. Benjie Lopez", rate: 88, status: "On Track" },
];

const alerts = [
  { icon: AlertTriangle, text: "3 sections fell below SF2 95% target this week", tone: "warn" },
  { icon: Bell, text: "SF2 reports due to Division Office on May 15", tone: "info" },
  { icon: AlertTriangle, text: "5 learners absent for 3+ consecutive days", tone: "warn" },
  { icon: Bell, text: "2 LRN reprint requests from advisers", tone: "info" },
];

const departmentBars = [
  { name: "JHS", attendance: jhs.rate, target: SF2_TARGET },
  { name: "SHS", attendance: shs.rate, target: SF2_TARGET },
];

const gradeChanges = [
  { teacher: "Ms. Aquino", student: "Juan Dela Cruz (G7 Sampaguita)", subject: "Math", from: "B (85)", to: "A (92)", time: "2h ago" },
  { teacher: "Mr. Lopez", student: "Maria Santos (G7 Rosal)", subject: "Science", from: "B+ (87)", to: "B+ (88)", time: "4h ago" },
  { teacher: "Ms. Cruz", student: "Jose Aguilar (G12 St. Ignatius)", subject: "English", from: "C+ (78)", to: "C (74)", time: "Yesterday" },
  { teacher: "Mr. Tan", student: "Andrea Mercado (G10 Del Pilar)", subject: "AP", from: "A- (89)", to: "A- (90)", time: "Yesterday" },
];

function SectionCard({ section }: { section: Section }) {
  const belowTarget = section.attendance < SF2_TARGET;
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        belowTarget
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/60 bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{section.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            Adviser: {section.adviser}
          </p>
        </div>
        <Badge variant={belowTarget ? "destructive" : "secondary"} className="shrink-0">
          {belowTarget ? "Below Target" : "On Target"}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Total Enrolled</p>
          <p className="text-base font-semibold text-foreground">{section.enrolled}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Attendance Rate</p>
          <p
            className={`text-base font-semibold ${
              belowTarget ? "text-destructive" : "text-foreground"
            }`}
          >
            {section.attendance.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(section.attendance, 100)}%`,
            background: belowTarget
              ? "var(--color-destructive)"
              : "var(--gradient-primary)",
          }}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const overallRate = ((totalPresent / totalEnrolled) * 100).toFixed(1);

  const metrics = [
    {
      label: "Total Enrolled (SY 25–26)",
      value: totalEnrolled.toString(),
      hint: `${departments[0].grades.length + departments[1].grades.length} grade levels`,
      icon: Users,
      accent: "text-chart-3",
    },
    {
      label: "Present Today",
      value: totalPresent.toString(),
      hint: `${overallRate}% campus-wide`,
      icon: UserCheck,
      accent: "text-chart-2",
    },
    {
      label: "SF2 Compliance",
      value: `${Math.round(((jhs.sections + shs.sections - totalBelow) / (jhs.sections + shs.sections)) * 100)}%`,
      hint: `${jhs.sections + shs.sections - totalBelow} of ${jhs.sections + shs.sections} sections on target`,
      icon: ShieldCheck,
      accent: "text-chart-1",
    },
    {
      label: "Sections Below Target",
      value: totalBelow.toString(),
      hint: `< ${SF2_TARGET}% SF2 attendance`,
      icon: AlertTriangle,
      accent: "text-destructive",
    },
  ];

  return (
    <>
      <PageHeader
        title="Principal's Portal"
        subtitle="Registrar's Overview · St. Mary's Academy · SY 2025–2026"
      />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Hero banner */}
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, Principal Reyes
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {totalEnrolled} learners · {overallRate}% present today
              </h2>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                {totalBelow} section{totalBelow === 1 ? "" : "s"} are tracking below the
                DepEd SF2 {SF2_TARGET}% attendance target. Review by department below
                before the SF2 cutoff.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase opacity-80">Quarter</p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase opacity-80">School Week</p>
                <p className="text-sm font-semibold">Week 6</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="overflow-hidden border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{m.hint}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Department breakdown */}
        <section className="grid gap-6 lg:grid-cols-2">
          {departments.map((dept) => {
            const stats = dept.key === "JHS" ? jhs : shs;
            return (
              <Card key={dept.key} className="border-border/60">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="rounded-lg p-2 text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {dept.key === "JHS" ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <School className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{dept.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">{dept.caption}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{stats.rate.toFixed(1)}%</p>
                    <p className="text-[11px] text-muted-foreground">
                      {stats.enrolled} enrolled · {stats.below} below target
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {dept.grades.map((g) => (
                    <div key={g.level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.level}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {g.sections.length} section{g.sections.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {g.sections.map((s) => (
                          <SectionCard key={s.name} section={s} />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Department comparison + 7-day trend */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Attendance vs SF2 Target</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis domain={[80, 100]} stroke="var(--color-muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="target" fill="var(--color-muted)" radius={[6, 6, 0, 0]} name="SF2 Target" />
                  <Bar dataKey="attendance" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Campus Attendance — Last 7 Days</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Avg 91.7%
              </span>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis domain={[80, 100]} stroke="var(--color-muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--color-chart-1)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Flagged learners + alerts */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Learners Needing Follow-up (SF2)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LRN</TableHead>
                      <TableHead>Learner</TableHead>
                      <TableHead>Grade & Section</TableHead>
                      <TableHead>Adviser</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedLearners.map((l) => {
                      const below = l.rate < SF2_TARGET;
                      return (
                        <TableRow key={l.lrn}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {l.lrn}
                          </TableCell>
                          <TableCell className="font-medium">{l.name}</TableCell>
                          <TableCell className="text-muted-foreground">{l.section}</TableCell>
                          <TableCell className="text-muted-foreground">{l.adviser}</TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              below ? "text-destructive" : ""
                            }`}
                          >
                            {l.rate}%
                          </TableCell>
                          <TableCell>
                            <Badge variant={below ? "destructive" : "secondary"}>
                              {l.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registrar Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className={`rounded-md p-2 ${
                      a.tone === "warn"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <a.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-snug">{a.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Grade changes audit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Grade Changes (Audit Trail)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Teacher</TableHead>
                    <TableHead>Learner (Section)</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeChanges.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>{g.teacher}</TableCell>
                      <TableCell className="font-medium">{g.student}</TableCell>
                      <TableCell className="text-muted-foreground">{g.subject}</TableCell>
                      <TableCell className="text-xs">
                        <span className="text-muted-foreground">{g.from}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{g.to}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{g.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Learner ID preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Learner ID Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="bg-primary px-4 py-3 text-primary-foreground">
                <p className="text-xs uppercase tracking-wide opacity-80">St. Mary's Academy</p>
                <p className="text-sm font-semibold">Learner Identification Card</p>
              </div>
              <div className="flex gap-4 p-4">
                <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold">Juan M. Dela Cruz</p>
                  <p className="text-sm text-muted-foreground">Grade 7 — Sampaguita</p>
                  <p className="mt-1 text-xs text-muted-foreground">LRN: 136728140987</p>
                  <p className="text-xs text-muted-foreground">SY 2025–2026 · JHS</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Scan LRN to verify</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                  <QrCode className="h-7 w-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center text-xs text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Aligned with DepEd SF1, SF2 & LRN standards · Prototype data
        </footer>
      </main>
    </>
  );
}
