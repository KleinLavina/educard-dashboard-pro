import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Users, GraduationCap, AlertTriangle, CheckCircle2, QrCode, BookOpen, School,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET, fullName, allLearners, allSections } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
  head: () => ({ meta: [{ title: `Students — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type DeptFilter = "all" | "JHS" | "SHS";

function StudentsPage() {
  const { role } = useRole();
  if (role === "student") return <StudentProfile />;
  if (role === "teacher") return <TeacherRoster />;
  return <PrincipalRoster />;
}

/* ─── Principal: full roster ─────────────────────────────── */
function PrincipalRoster() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<DeptFilter>("all");

  const filtered = allLearners.filter((l) => {
    const matchDept = dept === "all" || l.department.key === dept;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      fullName(l.learner).toLowerCase().includes(q) ||
      l.learner.lrn.includes(q) ||
      l.sectionLabel.toLowerCase().includes(q);
    return matchDept && matchSearch;
  });

  const atRisk = allLearners.filter((l) => l.status === "At Risk").length;

  return (
    <>
      <PageHeader title="Students" subtitle={`All learners · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Enrolled", value: allLearners.length, icon: Users, accent: "text-chart-3" },
            { label: "On Track", value: allLearners.length - atRisk, icon: CheckCircle2, accent: "text-chart-2" },
            { label: "At Risk", value: atRisk, icon: AlertTriangle, accent: "text-destructive" },
            { label: "Sections", value: allSections.length, icon: School, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Learner Roster</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "JHS", "SHS"] as DeptFilter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`rounded-full px-3 py-1 font-ui text-xs uppercase tracking-wider transition-colors ${
                    dept === d ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {d === "all" ? "All Depts" : d}
                </button>
              ))}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name or LRN…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-44 pl-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LRN</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead className="text-right">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.learner.lrn} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.learner.lrn}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{fullName(l.learner)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{l.sectionLabel}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider ${
                          l.department.key === "JHS" ? "bg-primary/10 text-primary" : "bg-chart-1/10 text-chart-1"
                        }`}>
                          {l.department.key}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${l.learner.gpa < 75 ? "text-destructive" : ""}`}>
                        {l.learner.gpa}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${l.learner.attendanceRate < SF2_TARGET ? "text-destructive" : ""}`}>
                        {l.learner.attendanceRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.status === "At Risk" ? "destructive" : "secondary"}>{l.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No learners match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{filtered.length} of {allLearners.length} learners shown</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Teacher: class roster ──────────────────────────────── */
function TeacherRoster() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const learners = mySection.section.learners;
  const classGpa = (learners.reduce((a, l) => a + l.gpa, 0) / learners.length).toFixed(1);
  const classAtt = (learners.reduce((a, l) => a + l.attendanceRate, 0) / learners.length).toFixed(1);

  return (
    <>
      <PageHeader title="My Students" subtitle={`${mySection.label} · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Class Size", value: learners.length, icon: Users, accent: "text-chart-3" },
            { label: "On Track", value: learners.filter(l => l.attendanceRate >= SF2_TARGET && l.gpa >= 75).length, icon: CheckCircle2, accent: "text-chart-2" },
            { label: "At Risk", value: learners.filter(l => l.attendanceRate < SF2_TARGET || l.gpa < 75).length, icon: AlertTriangle, accent: "text-destructive" },
            { label: "Avg GPA", value: classGpa, icon: GraduationCap, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade 7 — Sampaguita</CardTitle>
            <p className="text-xs text-muted-foreground">Class avg {classGpa} GPA · {classAtt}% attendance · SF2 target {SF2_TARGET}%</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {learners.map((l, i) => {
              const atRisk = l.attendanceRate < SF2_TARGET || l.gpa < 75;
              return (
                <div key={l.lrn} className={`flex items-center gap-4 rounded-xl border p-4 ${atRisk ? "border-destructive/30 bg-destructive/5" : "bg-card"}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{fullName(l)}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {l.lrn}</p>
                  </div>
                  <div className="hidden sm:flex gap-6 text-right text-sm">
                    <div>
                      <p className="font-ui text-[10px] uppercase text-muted-foreground">GPA</p>
                      <p className={`font-semibold ${l.gpa < 75 ? "text-destructive" : ""}`}>{l.gpa}</p>
                    </div>
                    <div>
                      <p className="font-ui text-[10px] uppercase text-muted-foreground">Attendance</p>
                      <p className={`font-semibold ${l.attendanceRate < SF2_TARGET ? "text-destructive" : ""}`}>{l.attendanceRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Badge variant={atRisk ? "destructive" : "secondary"}>{atRisk ? "At Risk" : "On Track"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Student: own profile ───────────────────────────────── */
function StudentProfile() {
  const myRecord = allLearners.find((l) => l.learner.lrn === "136728140987")!;
  const l = myRecord.learner;
  const classmates = myRecord.section.learners.filter((m) => m.lrn !== l.lrn);

  return (
    <>
      <PageHeader title="My Profile" subtitle={`${fullName(l)} · ${myRecord.sectionLabel} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <Card className="overflow-hidden">
          <div className="h-28 w-full" style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }} />
          <CardContent className="relative pt-0">
            <div className="-mt-10 flex items-end gap-4 pb-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-muted shadow-md text-muted-foreground">
                <Users className="h-9 w-9" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold">{fullName(l)}</h2>
                <p className="text-sm text-muted-foreground">{myRecord.sectionLabel} · SY {SCHOOL_YEAR}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-chart-2/10 px-3 py-1.5 text-xs font-semibold text-chart-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> On Track
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
              {[
                { label: "LRN", value: l.lrn, mono: true },
                { label: "GPA (Q3)", value: l.gpa.toString() },
                { label: "Attendance", value: `${l.attendanceRate.toFixed(1)}%` },
                { label: "Class Rank", value: `#1 of ${myRecord.section.learners.length}` },
              ].map((f) => (
                <div key={f.label}>
                  <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className={`mt-0.5 text-sm font-semibold ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Classmates</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {classmates.map((m) => (
                <div key={m.lrn} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{fullName(m)}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {m.lrn}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">GPA {m.gpa}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode className="h-4 w-4" /> Quick ID</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border bg-muted">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Name: </span><span className="font-semibold">{fullName(l)}</span></p>
                <p><span className="text-muted-foreground">LRN: </span><span className="font-mono font-semibold">{l.lrn}</span></p>
                <p><span className="text-muted-foreground">Section: </span>{myRecord.sectionLabel}</p>
                <p><span className="text-muted-foreground">School: </span>{SCHOOL_NAME}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
