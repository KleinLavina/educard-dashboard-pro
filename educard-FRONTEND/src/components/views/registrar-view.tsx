import {
  Users,
  UserCheck,
  IdCard,
  Printer,
  FileEdit,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  GraduationCap,
  Upload,
  Download,
} from "lucide-react";
import {
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
import { Button } from "@/components/ui/button";
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
  allSections,
} from "@/lib/school-data";

const jhs = departmentStats(departments[0]);
const shs = departmentStats(departments[1]);

const enrollmentByGrade = [
  { grade: "G7", count: 6 },
  { grade: "G8", count: 4 },
  { grade: "G9", count: 4 },
  { grade: "G10", count: 4 },
  { grade: "G11", count: 4 },
  { grade: "G12", count: 4 },
];

const recentActivity = [
  { icon: IdCard, text: "ID card printed for Juan M. Dela Cruz (LRN 136728140987)", time: "15 min ago", tone: "ok" },
  { icon: Printer, text: "2 ID reprint requests approved for Grade 8 - Adelfa", time: "1h ago", tone: "info" },
  { icon: FileEdit, text: "LRN correction submitted to DepEd for Maria L. Santos", time: "2h ago", tone: "info" },
  { icon: Upload, text: "SF2 attendance data uploaded for 3rd Quarter", time: "Today", tone: "ok" },
];

const pendingTasks = [
  { task: "Process 5 new enrollment applications", priority: "High", dueDate: "May 12" },
  { task: "Review 3 LRN reprint requests", priority: "Medium", dueDate: "May 13" },
  { task: "Update student photos for Grade 9 - Bonifacio", priority: "Low", dueDate: "May 15" },
  { task: "Generate SF1 reports for Division Office", priority: "High", dueDate: "May 14" },
];

const recentEnrollments = allLearners.slice(0, 5);

export function RegistrarView() {
  const metrics = [
    {
      label: `Total Enrolled (SY ${SCHOOL_YEAR})`,
      value: totals.enrolled.toString(),
      hint: `${totals.sections} sections, 6 grade levels`,
      icon: Users,
      accent: "text-chart-3",
    },
    {
      label: "ID Cards Printed",
      value: `${totals.enrolled - 3}`,
      hint: "3 pending reprints",
      icon: IdCard,
      accent: "text-chart-1",
    },
    {
      label: "SF2 Submissions",
      value: `${totals.sections - totals.below}/${totals.sections}`,
      hint: `${totals.below} sections pending`,
      icon: CalendarCheck,
      accent: totals.below > 0 ? "text-destructive" : "text-chart-2",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.length.toString(),
      hint: "Enrollment & LRN requests",
      icon: AlertTriangle,
      accent: "text-chart-4",
    },
  ];

  return (
    <>
      <PageHeader
        title="Registrar's Office"
        subtitle={`Records Management · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "linear-gradient(135deg, oklch(0.55 0.20 260), oklch(0.70 0.18 280))" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, Registrar
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {totals.enrolled} enrolled learners · {totals.sections} sections
              </h2>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                {pendingTasks.filter(t => t.priority === "High").length} high-priority tasks pending.
                {totals.below > 0 && ` ${totals.below} sections need SF2 attendance updates.`}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Quarter</p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">School Year</p>
                <p className="text-sm font-semibold">2025-26</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollment by Grade Level</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentByGrade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} name="Learners" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Pending Tasks</CardTitle>
              <Badge variant="outline">{pendingTasks.length} tasks</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{task.task}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> Due: {task.dueDate}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "High"
                        ? "destructive"
                        : task.priority === "Medium"
                        ? "default"
                        : "secondary"
                    }
                    className="shrink-0"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Recent Enrollments</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">Latest student registrations</p>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" /> Bulk Import
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LRN</TableHead>
                      <TableHead>Learner Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>ID Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEnrollments.map((l) => (
                      <TableRow key={l.learner.lrn}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {l.learner.lrn}
                        </TableCell>
                        <TableCell className="font-medium">{fullName(l.learner)}</TableCell>
                        <TableCell className="text-muted-foreground">{l.sectionLabel}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Printed
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileEdit className="h-4 w-4" />
                          </Button>
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
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div
                    className={`rounded-md p-2 ${
                      a.tone === "ok"
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">ID Card Management</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4" /> Print Queue
                </Button>
                <Button size="sm" style={{ background: "linear-gradient(135deg, oklch(0.55 0.20 260), oklch(0.70 0.18 280))" }}>
                  <IdCard className="h-4 w-4" /> New ID
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="text-sm font-medium">Total IDs Printed</p>
                    <p className="text-2xl font-bold">{totals.enrolled - 3}</p>
                  </div>
                  <div className="rounded-lg bg-chart-1/10 p-3 text-chart-1">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div>
                    <p className="text-sm font-medium">Pending Reprints</p>
                    <p className="text-2xl font-bold text-destructive">3</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="mr-2 h-4 w-4" /> Register New Student
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileEdit className="mr-2 h-4 w-4" /> Update LRN Records
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Download className="mr-2 h-4 w-4" /> Export SF1 Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <CalendarCheck className="mr-2 h-4 w-4" /> Submit SF2 Attendance
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Registrar's Office · {SCHOOL_NAME} · SY {SCHOOL_YEAR}
        </footer>
      </main>
    </>
  );
}
