import { useState } from "react";
import {
  Users,
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  Upload,
  Save,
  GraduationCap,
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
import { Input } from "@/components/ui/input";
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
  fullName,
  allSections,
} from "@/lib/school-data";

const TEACHER_NAME = "Ms. Aurora Aquino";
const TEACHER_SECTION_ID = "g7-sampaguita";

const mySection = allSections.find((s) => s.section.id === TEACHER_SECTION_ID)!;
const mySectionLearners = mySection.section.learners;

const initialGrades: Record<string, Record<string, number>> = {
  "136728140987": { Math: 92, Science: 90, English: 88, Filipino: 94, AP: 91, MAPEH: 95 },
  "136728140988": { Math: 85, Science: 83, English: 87, Filipino: 89, AP: 84, MAPEH: 90 },
  "136728140989": { Math: 90, Science: 92, English: 88, Filipino: 91, AP: 89, MAPEH: 94 },
};

const subjects = ["Math", "Science", "English", "Filipino", "AP", "MAPEH"];

const classAvgBySubject = subjects.map((subj) => ({
  subject: subj,
  avg: Math.round(
    mySectionLearners.reduce((a, l) => a + (initialGrades[l.lrn]?.[subj] ?? 85), 0) /
      mySectionLearners.length,
  ),
}));

const weeklyAttendance = [
  { day: "Mon", present: 3, absent: 0 },
  { day: "Tue", present: 2, absent: 1 },
  { day: "Wed", present: 3, absent: 0 },
  { day: "Thu", present: 3, absent: 0 },
  { day: "Fri", present: 2, absent: 1 },
];

const recentActivity = [
  { text: "Grade posted for Math — 3rd Quarter", time: "2h ago", icon: CheckCircle2, tone: "ok" },
  { text: "Carlo Villanueva absent (2nd consecutive day)", time: "Today", icon: AlertTriangle, tone: "warn" },
  { text: "SF2 attendance submitted to registrar", time: "Yesterday", icon: CalendarCheck, tone: "ok" },
  { text: "Grade import from CSV — Science completed", time: "2d ago", icon: Upload, tone: "ok" },
];

export function TeacherView() {
  const [editMode, setEditMode] = useState(false);
  const [grades, setGrades] = useState(initialGrades);

  const atRisk = mySectionLearners.filter(
    (l) => l.attendanceRate < SF2_TARGET || (grades[l.lrn] && Object.values(grades[l.lrn]).some((g) => g < 75)),
  );

  const classAvgGpa =
    mySectionLearners.reduce((a, l) => a + l.gpa, 0) / mySectionLearners.length;
  const classAttendance =
    mySectionLearners.reduce((a, l) => a + l.attendanceRate, 0) / mySectionLearners.length;

  return (
    <>
      <PageHeader
        title="Teacher Portal"
        subtitle={`${TEACHER_NAME} · ${mySection.label} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-accent)" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, {TEACHER_NAME}
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {mySection.label} · {mySectionLearners.length} learners
              </h2>
              <p className="mt-2 text-sm opacity-90">
                Class avg {classAvgGpa.toFixed(1)} GPA · Attendance {classAttendance.toFixed(1)}%
                {atRisk.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                    {atRisk.length} at-risk
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Quarter</p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Section</p>
                <p className="text-sm font-semibold">Grade 7</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Class Size", value: mySectionLearners.length.toString(), hint: mySection.label, icon: Users, accent: "text-chart-3" },
            { label: "Class Avg GPA", value: classAvgGpa.toFixed(1), hint: "3rd Quarter", icon: BookOpen, accent: "text-chart-1" },
            { label: "Attendance Rate", value: `${classAttendance.toFixed(1)}%`, hint: `SF2 target ${SF2_TARGET}%`, icon: CalendarCheck, accent: classAttendance < SF2_TARGET ? "text-destructive" : "text-chart-2" },
            { label: "At-Risk Learners", value: atRisk.length.toString(), hint: "Below target or GPA < 75", icon: AlertTriangle, accent: atRisk.length > 0 ? "text-destructive" : "text-chart-2" },
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Grade Entry — {mySection.label}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">3rd Quarter · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" /> Import CSV
              </Button>
              {editMode ? (
                <Button size="sm" style={{ background: "var(--gradient-accent)" }} onClick={() => setEditMode(false)}>
                  <Save className="h-4 w-4" /> Save Grades
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                  Edit Grades
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LRN</TableHead>
                    <TableHead>Learner Name</TableHead>
                    {subjects.map((s) => (
                      <TableHead key={s} className="text-center">{s}</TableHead>
                    ))}
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySectionLearners.map((l) => {
                    const lg = grades[l.lrn] ?? {};
                    const gpaVals = subjects.map((s) => lg[s] ?? 85);
                    const avg = gpaVals.reduce((a, v) => a + v, 0) / gpaVals.length;
                    const atR = avg < 75 || l.attendanceRate < SF2_TARGET;
                    return (
                      <TableRow key={l.lrn}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{l.lrn}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{fullName(l)}</TableCell>
                        {subjects.map((s) => (
                          <TableCell key={s} className="text-center p-1">
                            {editMode ? (
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={lg[s] ?? 85}
                                onChange={(e) =>
                                  setGrades((prev) => ({
                                    ...prev,
                                    [l.lrn]: { ...prev[l.lrn], [s]: Number(e.target.value) },
                                  }))
                                }
                                className="h-8 w-16 text-center text-sm"
                              />
                            ) : (
                              <span className={`font-medium ${(lg[s] ?? 85) < 75 ? "text-destructive" : ""}`}>
                                {lg[s] ?? 85}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold">{avg.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge variant={atR ? "destructive" : "secondary"}>
                            {atR ? "At Risk" : "On Track"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {editMode && (
              <p className="mt-3 text-xs text-muted-foreground">
                Grading formula: 30% Quiz · 40% Exam · 30% Activity (configurable in Settings)
              </p>
            )}
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class Average by Subject</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAvgBySubject}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="avg" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} name="Class Avg" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Weekly Attendance</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {classAttendance.toFixed(1)}% avg
              </span>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="present" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Present" stackId="a" />
                  <Bar dataKey="absent" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} name="Absent" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">At-Risk Learners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atRisk.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  <p className="text-sm text-muted-foreground">All learners are currently on track.</p>
                </div>
              ) : (
                atRisk.map((l) => (
                  <div key={l.lrn} className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{fullName(l)}</p>
                      <p className="text-xs text-muted-foreground">LRN: {l.lrn}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {l.attendanceRate < SF2_TARGET && (
                        <Badge variant="destructive">{l.attendanceRate.toFixed(1)}% att.</Badge>
                      )}
                      {Object.values(grades[l.lrn] ?? {}).some((g) => g < 75) && (
                        <Badge variant="destructive">Low grade</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className={`rounded-md p-2 ${a.tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-chart-2/10 text-chart-2"}`}>
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

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Teacher Portal · {SCHOOL_NAME} · SY {SCHOOL_YEAR}
        </footer>
      </main>
    </>
  );
}
