import {
  Users,
  UserCheck,
  AlertTriangle,
  Bell,
  QrCode,
  TrendingUp,
  School,
  BookOpen,
  ShieldCheck,
  GraduationCap,
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
import {
  SF2_TARGET,
  SCHOOL_NAME,
  SCHOOL_YEAR,
  departments,
  departmentStats,
  allLearners,
  totals,
  fullName,
  type Section as SectionT,
} from "@/lib/school-data";

const jhs = departmentStats(departments[0]);
const shs = departmentStats(departments[1]);

const attendanceTrend = [
  { day: "Mon", value: 94 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 89 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 91 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 93 },
];

const departmentBars = [
  { name: "JHS", attendance: Number(jhs.rate.toFixed(1)), target: SF2_TARGET },
  { name: "SHS", attendance: Number(shs.rate.toFixed(1)), target: SF2_TARGET },
];

const flaggedLearners = allLearners
  .filter((l) => l.learner.attendanceRate < SF2_TARGET)
  .sort((a, b) => a.learner.attendanceRate - b.learner.attendanceRate)
  .slice(0, 6);

const alerts = [
  { icon: AlertTriangle, text: `${totals.below} sections below SF2 ${SF2_TARGET}% target`, tone: "warn" },
  { icon: Bell, text: "SF2 reports due to Division Office on May 15", tone: "info" },
  { icon: AlertTriangle, text: `${flaggedLearners.length} learners flagged for chronic absence`, tone: "warn" },
  { icon: Bell, text: "2 LRN reprint requests from advisers", tone: "info" },
];

function SectionCard({ section, adviser }: { section: SectionT; adviser: string }) {
  const enrolled = section.learners.length;
  const attendance = enrolled
    ? section.learners.reduce((a, l) => a + l.attendanceRate, 0) / enrolled
    : 0;
  const belowTarget = attendance < SF2_TARGET;

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
          <p className="truncate text-sm font-semibold">
            {section.strand ? `${section.strand} — ${section.name}` : section.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">Adviser: {adviser}</p>
        </div>
        <Badge variant={belowTarget ? "destructive" : "secondary"} className="shrink-0">
          {belowTarget ? "Below Target" : "On Target"}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-ui text-muted-foreground">Total Enrolled</p>
          <p className="text-base font-semibold text-foreground">{enrolled}</p>
        </div>
        <div>
          <p className="font-ui text-muted-foreground">Attendance Rate</p>
          <p className={`text-base font-semibold ${belowTarget ? "text-destructive" : ""}`}>
            {attendance.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(attendance, 100)}%`,
            background: belowTarget ? "var(--color-destructive)" : "var(--gradient-primary)",
          }}
        />
      </div>
    </div>
  );
}

export function PrincipalView() {
  const overallRate = totals.campusAttendance.toFixed(1);
  const compliancePct = Math.round(
    ((totals.sections - totals.below) / totals.sections) * 100,
  );

  const metrics = [
    {
      label: `Total Enrolled (SY ${SCHOOL_YEAR})`,
      value: totals.enrolled.toString(),
      hint: `${totals.sections} sections, 6 grade levels`,
      icon: Users,
      accent: "text-chart-3",
    },
    {
      label: "Campus Attendance",
      value: `${overallRate}%`,
      hint: `SF2 target ${SF2_TARGET}%`,
      icon: UserCheck,
      accent: "text-chart-2",
    },
    {
      label: "SF2 Compliance",
      value: `${compliancePct}%`,
      hint: `${totals.sections - totals.below} of ${totals.sections} sections on target`,
      icon: ShieldCheck,
      accent: "text-chart-1",
    },
    {
      label: "Sections Below Target",
      value: totals.below.toString(),
      hint: `< ${SF2_TARGET}% SF2 attendance`,
      icon: AlertTriangle,
      accent: "text-destructive",
    },
  ];

  return (
    <>
      <PageHeader
        title="Principal's Portal"
        subtitle={`Registrar's Overview · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, Principal Reyes
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {totals.enrolled} learners · {overallRate}% campus attendance
              </h2>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                {totals.below} section{totals.below === 1 ? "" : "s"} are tracking below the
                DepEd SF2 {SF2_TARGET}% target. Review by department before the SF2 cutoff.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Quarter</p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">School Week</p>
                <p className="text-sm font-semibold">Week 6</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="overflow-hidden border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                      {stats.enrolled} learners · {stats.below} below target
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {dept.grades.map((g) => (
                    <div key={g.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.label}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {g.sections.length} section{g.sections.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {g.sections.map((s) => (
                          <SectionCard key={s.id} section={s} adviser={s.adviser} />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </section>

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
                <LineChart data={attendanceTrend}>
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
                      <TableHead>Section</TableHead>
                      <TableHead>Adviser</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedLearners.map((l) => (
                      <TableRow key={l.learner.lrn}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {l.learner.lrn}
                        </TableCell>
                        <TableCell className="font-medium">{fullName(l.learner)}</TableCell>
                        <TableCell className="text-muted-foreground">{l.sectionLabel}</TableCell>
                        <TableCell className="text-muted-foreground">{l.section.adviser}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {l.learner.attendanceRate.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Below SF2</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Learner ID Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const sample = allLearners[0];
              return (
                <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="bg-primary px-4 py-3 text-primary-foreground">
                    <p className="text-xs uppercase tracking-wide opacity-80">{SCHOOL_NAME}</p>
                    <p className="text-sm font-semibold">Learner Identification Card</p>
                  </div>
                  <div className="flex gap-4 p-4">
                    <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold">{fullName(sample.learner)}</p>
                      <p className="text-sm text-muted-foreground">{sample.sectionLabel}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        LRN: {sample.learner.lrn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SY {SCHOOL_YEAR} · {sample.department.key}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                    <div className="text-xs text-muted-foreground">Scan LRN to verify</div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                      <QrCode className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Aligned with DepEd SF1, SF2 &amp; LRN standards · Prototype data
        </footer>
      </main>
    </>
  );
}
