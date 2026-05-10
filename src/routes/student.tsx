import { createFileRoute } from "@tanstack/react-router";
import {
  QrCode,
  CalendarCheck,
  BookOpen,
  Bell,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageCircle,
  GraduationCap,
  Users,
  Star,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  SCHOOL_NAME,
  SCHOOL_YEAR,
  SF2_TARGET,
  fullName,
  allLearners,
} from "@/lib/school-data";

export const Route = createFileRoute("/student")({
  component: StudentDashboard,
  head: () => ({
    meta: [
      { title: `Student Portal — ${SCHOOL_NAME} (EduCard Pro)` },
      { name: "description", content: "Student grade viewer, attendance history, and ID card access." },
    ],
  }),
});

const STUDENT_LRN = "136728140987";
const myRecord = allLearners.find((l) => l.learner.lrn === STUDENT_LRN)!;
const myLearner = myRecord.learner;

const subjects = [
  { name: "Math", q1: 89, q2: 91, q3: 92, q4: null },
  { name: "Science", q1: 87, q2: 88, q3: 90, q4: null },
  { name: "English", q1: 85, q2: 87, q3: 88, q4: null },
  { name: "Filipino", q1: 91, q2: 93, q3: 94, q4: null },
  { name: "AP", q1: 88, q2: 90, q3: 91, q4: null },
  { name: "MAPEH", q1: 93, q2: 94, q3: 95, q4: null },
];

const radarData = subjects.map((s) => ({ subject: s.name, score: s.q3 }));

const attendanceHistory = [
  { week: "Wk 1", rate: 100 },
  { week: "Wk 2", rate: 100 },
  { week: "Wk 3", rate: 80 },
  { week: "Wk 4", rate: 100 },
  { week: "Wk 5", rate: 100 },
  { week: "Wk 6", rate: 96.4 },
];

const notifications = [
  {
    icon: BookOpen,
    title: "Math 3rd Quarter grade posted",
    text: "Ms. Aquino posted your grade: 92 — On Track",
    time: "2h ago",
    tone: "ok",
  },
  {
    icon: CalendarCheck,
    title: "Attendance confirmed",
    text: "Time-in scanned at 7:38 AM. Have a great day!",
    time: "Today",
    tone: "ok",
  },
  {
    icon: Bell,
    title: "SF2 report reminder",
    text: "3rd Quarter SF2 will be reviewed by adviser on May 15.",
    time: "Yesterday",
    tone: "info",
  },
  {
    icon: Star,
    title: "Highest in class — Filipino",
    text: "You ranked 1st in Filipino this quarter. Congratulations!",
    time: "2d ago",
    tone: "ok",
  },
];

const conductLog = [
  { date: "May 5", item: "Participated in Science Lab", type: "Positive" },
  { date: "Apr 28", item: "Submitted project on time", type: "Positive" },
  { date: "Apr 12", item: "Late arrival — 8:15 AM", type: "Note" },
];

function StudentDashboard() {
  const currentQ3Avg =
    subjects.reduce((a, s) => a + s.q3, 0) / subjects.length;
  const isAboveTarget = myLearner.attendanceRate >= SF2_TARGET;

  return (
    <>
      <PageHeader
        title="Student Portal"
        subtitle={`${fullName(myLearner)} · ${myRecord.sectionLabel} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {fullName(myLearner)}
              </h2>
              <p className="mt-1 font-mono text-sm opacity-80">LRN: {myLearner.lrn}</p>
              <p className="mt-2 text-sm opacity-90">
                GPA {currentQ3Avg.toFixed(1)} · Attendance {myLearner.attendanceRate.toFixed(1)}%
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${isAboveTarget ? "bg-white/25" : "bg-white/20"}`}>
                  {isAboveTarget ? "On Track" : "Needs Attention"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Quarter</p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Rank</p>
                <p className="text-sm font-semibold">#1</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "GPA This Quarter",
              value: currentQ3Avg.toFixed(1),
              hint: "3rd Quarter average",
              icon: BookOpen,
              accent: "text-chart-1",
            },
            {
              label: "Attendance Rate",
              value: `${myLearner.attendanceRate.toFixed(1)}%`,
              hint: `SF2 target ${SF2_TARGET}%`,
              icon: CalendarCheck,
              accent: isAboveTarget ? "text-chart-2" : "text-destructive",
            },
            {
              label: "Days Attended",
              value: "52",
              hint: "Out of 54 school days",
              icon: CheckCircle2,
              accent: "text-chart-2",
            },
            {
              label: "Subjects",
              value: subjects.length.toString(),
              hint: "3rd Quarter enrolled",
              icon: Star,
              accent: "text-chart-3",
            },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
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

        {/* Grades Table + Radar */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">My Grades — 3rd Quarter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-ui text-xs uppercase tracking-wide text-muted-foreground">Subject</th>
                      <th className="pb-2 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground">Q1</th>
                      <th className="pb-2 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground">Q2</th>
                      <th className="pb-2 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground">Q3</th>
                      <th className="pb-2 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground">Q4</th>
                      <th className="pb-2 text-right font-ui text-xs uppercase tracking-wide text-muted-foreground">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {subjects.map((s) => {
                      const avg = Math.round((s.q1 + s.q2 + s.q3) / 3);
                      return (
                        <tr key={s.name}>
                          <td className="py-3 font-medium">{s.name}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q1}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q2}</td>
                          <td className="py-3 text-center font-semibold text-foreground">{s.q3}</td>
                          <td className="py-3 text-center text-muted-foreground">—</td>
                          <td className="py-3 text-right">
                            <span className={`font-semibold ${avg >= 90 ? "text-chart-2" : avg < 75 ? "text-destructive" : ""}`}>
                              {avg}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td className="pt-3 font-ui text-xs uppercase tracking-wide text-muted-foreground" colSpan={5}>General Average</td>
                      <td className="pt-3 text-right text-base font-bold">{currentQ3Avg.toFixed(1)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Radar</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" fontSize={11} stroke="var(--color-muted-foreground)" />
                  <Radar
                    name="Grade"
                    dataKey="score"
                    stroke="var(--color-chart-3)"
                    fill="var(--color-chart-3)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Attendance trend + Notifications */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Attendance — This Quarter</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {myLearner.attendanceRate.toFixed(1)}% overall
              </span>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={11} unit="%" />
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
                    dataKey="rate"
                    stroke="var(--color-chart-3)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--color-chart-3)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className={`rounded-md p-2 shrink-0 ${n.tone === "ok" ? "bg-chart-2/10 text-chart-2" : "bg-primary/10 text-primary"}`}>
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.text}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ID Card + Conduct */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Learner ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
                <div
                  className="px-4 py-3 text-primary-foreground"
                  style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }}
                >
                  <p className="text-xs uppercase tracking-wide opacity-80">{SCHOOL_NAME}</p>
                  <p className="text-sm font-semibold">Learner Identification Card</p>
                </div>
                <div className="flex gap-4 p-4">
                  <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold">{fullName(myLearner)}</p>
                    <p className="text-sm text-muted-foreground">{myRecord.sectionLabel}</p>
                    <p className="mt-1 font-ui text-[10px] uppercase tracking-wide text-muted-foreground">LRN</p>
                    <p className="font-mono text-sm font-semibold tracking-wider">{myLearner.lrn}</p>
                    <p className="text-xs text-muted-foreground">SY {SCHOOL_YEAR} · {myRecord.department.key}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Scan LRN to verify attendance</p>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                    <QrCode className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conduct Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conductLog.map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className={`rounded-md p-2 shrink-0 ${c.type === "Positive" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"}`}>
                    {c.type === "Positive" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.item}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                      <Badge variant={c.type === "Positive" ? "secondary" : "outline"} className="text-[10px]">
                        {c.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Student Portal · {SCHOOL_NAME} · SY {SCHOOL_YEAR}
        </footer>
      </main>
    </>
  );
}
