import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertTriangle,
  Bell,
  Calendar,
  QrCode,
  TrendingUp,
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
      { title: "EduCard Pro — St. Mary's Academy Admin Dashboard" },
      {
        name: "description",
        content:
          "EduCard Pro school management dashboard: attendance, grades, alerts, and student insights.",
      },
    ],
  }),
});

const attendanceData = [
  { day: "Mon", value: 94 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 89 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 91 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 93 },
];

const students = [
  { name: "Juan Dela Cruz", grade: "Grade 7 - Sampaguita", last: "Today", latest: "A (92)", status: "On Track" },
  { name: "Maria Santos", grade: "Grade 8 - Rosal", last: "Today", latest: "B+ (88)", status: "On Track" },
  { name: "Jose Rizal", grade: "Grade 9 - Adelfa", last: "3 days ago", latest: "C (74)", status: "At Risk" },
  { name: "Andrea Mercado", grade: "Grade 10 - Ilang-Ilang", last: "Today", latest: "A- (90)", status: "On Track" },
  { name: "Marco Reyes", grade: "Grade 7 - Sampaguita", last: "5 days ago", latest: "D (68)", status: "At Risk" },
  { name: "Liza Bautista", grade: "Grade 11 - STEM", last: "Today", latest: "A (94)", status: "On Track" },
];

const alerts = [
  { icon: AlertTriangle, text: "5 students absent for 3+ days", tone: "warn" },
  { icon: Bell, text: "3 report cards pending printing", tone: "info" },
  { icon: Bell, text: "1 parent requested ID reprint", tone: "info" },
  { icon: AlertTriangle, text: "2 grade disputes awaiting review", tone: "warn" },
];

const classPerformance = [
  { name: "G7 Sampaguita", avg: 84 },
  { name: "G8 Rosal", avg: 88 },
  { name: "G9 Adelfa", avg: 79 },
  { name: "G10 Ilang", avg: 91 },
  { name: "G11 STEM", avg: 87 },
];

const gradeChanges = [
  { teacher: "Ms. Aquino", student: "Juan Dela Cruz", subject: "Math", from: "B (85)", to: "A (92)", time: "2h ago" },
  { teacher: "Mr. Lopez", student: "Maria Santos", subject: "Science", from: "B+ (87)", to: "B+ (88)", time: "4h ago" },
  { teacher: "Ms. Cruz", student: "Jose Rizal", subject: "English", from: "C+ (78)", to: "C (74)", time: "Yesterday" },
  { teacher: "Mr. Tan", student: "Andrea Mercado", subject: "History", from: "A- (89)", to: "A- (90)", time: "Yesterday" },
];

function Dashboard() {
  const metrics = [
    { label: "Total Students", value: "487", icon: Users, accent: "text-chart-3" },
    { label: "Present Today", value: "452", icon: UserCheck, accent: "text-chart-2" },
    { label: "Average Grade", value: "86.4%", icon: GraduationCap, accent: "text-chart-1" },
    { label: "At-risk Students", value: "12", icon: AlertTriangle, accent: "text-destructive" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Admin overview · St. Mary's Academy" />
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
                Good morning, Principal
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                487 students · 92.7% present today
              </h2>
              <p className="mt-2 max-w-lg text-sm opacity-90">
                A calm morning across campus. 12 students need follow-up and 3 report cards are queued for printing.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase opacity-80">Term</p>
                <p className="text-sm font-semibold">3rd Quarter</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase opacity-80">Week</p>
                <p className="text-sm font-semibold">Week 6</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="overflow-hidden border-border/60">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Attendance chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Attendance — Last 7 Days</CardTitle>
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

        {/* Activity + Alerts */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recent Student Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Last Attendance</TableHead>
                      <TableHead>Latest Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.grade}</TableCell>
                        <TableCell className="text-muted-foreground">{s.last}</TableCell>
                        <TableCell>{s.latest}</TableCell>
                        <TableCell>
                          <Badge
                            variant={s.status === "At Risk" ? "destructive" : "secondary"}
                          >
                            {s.status}
                          </Badge>
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
              <CardTitle className="text-base">Alerts & Notifications</CardTitle>
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

        {/* Class performance + Grade changes */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="avg" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Grade Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Student</TableHead>
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
                        <TableCell className="text-muted-foreground text-xs">{g.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Student ID preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student ID Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="bg-primary px-4 py-3 text-primary-foreground">
                <p className="text-xs uppercase tracking-wide opacity-80">St. Mary's Academy</p>
                <p className="text-sm font-semibold">Student Identification Card</p>
              </div>
              <div className="flex gap-4 p-4">
                <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold">Juan Dela Cruz</p>
                  <p className="text-sm text-muted-foreground">Grade 7 — Sampaguita</p>
                  <p className="mt-1 text-xs text-muted-foreground">ID: 2026-0487</p>
                  <p className="text-xs text-muted-foreground">SY 2025–2026</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Scan to verify</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                  <QrCode className="h-7 w-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="pt-4 pb-2 text-center text-xs text-muted-foreground">
          EduCard Pro · Prototype with mock data
        </footer>
      </main>
    </>
  );
}
