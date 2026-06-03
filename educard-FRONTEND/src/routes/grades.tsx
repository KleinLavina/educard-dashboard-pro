import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GraduationCap, TrendingUp, CheckCircle2, Save, Upload, Download, History, BarChart3, FileText, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { SCHOOL_NAME, SCHOOL_YEAR, allSections, allLearners } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";
import { Grade } from "@/lib/api";
import { useSections, useLearners, useUpsertGrade, useSubjects, useGradesBySection, useLearnerGrades, useGrades, useMyTeacherSection, useMyLearner } from "@/lib/use-api";

export const Route = createFileRoute("/grades")({
  component: GradesPage,
});

function GradesPage() {
  const { role } = useRole();
  if (role === "teacher") return <TeacherGradeBook />;
  if (role === "student") return <StudentTranscript />;
  if (role === "parent")  return <ParentGrades />;
  return <PrincipalGradeOverview />;
}

/* ─── Parent: children grades overview ────────────────────── */
function ParentGrades() {
  const { data: childrenPage } = useLearners();
  const children = childrenPage?.results ?? [];
  const [activeChildIdx, setActiveChildIdx] = useState(0);
  const activeChild = children[activeChildIdx] ?? null;

  const { data: apiGrades = [] } = useLearnerGrades(activeChild?.id ?? null);

  const gradesBySubject = apiGrades.reduce<Record<string, { q1: number | null; q2: number | null; q3: number | null }>>(
    (acc, g) => {
      if (!acc[g.subject_name]) acc[g.subject_name] = { q1: null, q2: null, q3: null };
      if (g.quarter === 1) acc[g.subject_name].q1 = g.computed_grade;
      if (g.quarter === 2) acc[g.subject_name].q2 = g.computed_grade;
      if (g.quarter === 3) acc[g.subject_name].q3 = g.computed_grade;
      return acc;
    },
    {}
  );
  const grades = Object.entries(gradesBySubject).map(([subject, g]) => ({
    subject,
    q1: g.q1,
    q2: g.q2,
    q3: g.q3,
  }));

  const currentQGrades = grades.map(s => s.q3 ?? s.q2 ?? s.q1 ?? 0);
  const avg = currentQGrades.length > 0
    ? currentQGrades.reduce((a, v) => a + v, 0) / currentQGrades.length
    : 0;

  return (
    <>
      <PageHeader title="Children's Grades" subtitle={`Family Portal · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Child selector */}
        <div className="flex flex-wrap gap-2">
          {children.map((c, idx) => (
            <button
              key={c.lrn}
              onClick={() => setActiveChildIdx(idx)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${activeChildIdx === idx ? "text-primary-foreground shadow-sm" : "border bg-card text-muted-foreground hover:bg-muted"}`}
              style={activeChildIdx === idx ? { background: "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))" } : {}}
            >
              {c.full_name}
            </button>
          ))}
        </div>

        {/* Summary */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "General Avg", value: avg > 0 ? avg.toFixed(1) : "—", accent: "text-chart-1" },
            { label: "With Honors", value: avg >= 90 ? "Yes" : avg > 0 ? "No" : "—", accent: avg >= 90 ? "text-chart-2" : "text-muted-foreground" },
            { label: "Subjects",    value: grades.length || "—", accent: "text-chart-3" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Grades table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {activeChild?.full_name ?? "—"} — Academic Transcript
            </CardTitle>
            <p className="text-xs text-muted-foreground">{activeChild?.section_label ?? "—"} · {SCHOOL_NAME}</p>
          </CardHeader>
          <CardContent>
            {grades.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {activeChild ? "No grade records found for this child." : "Select a child to view grades."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {["Subject", "Q1", "Q2", "Q3 (Current)", "Avg", "Remarks"].map((h) => (
                        <th key={h} className={`pb-3 font-ui text-xs uppercase tracking-wide text-muted-foreground ${h === "Subject" ? "text-left" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {grades.map((s) => {
                      const vals = [s.q1, s.q2, s.q3].filter((v): v is number => v !== null);
                      const cellAvg = vals.length > 0 ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : 0;
                      return (
                        <tr key={s.subject} className="hover:bg-muted/30">
                          <td className="py-3 font-semibold">{s.subject}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q1 ?? "—"}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q2 ?? "—"}</td>
                          <td className="py-3 text-center font-bold">{s.q3 ?? "—"}</td>
                          <td className={`py-3 text-center font-semibold ${cellAvg >= 90 ? "text-chart-2" : cellAvg > 0 && cellAvg < 75 ? "text-destructive" : ""}`}>{cellAvg || "—"}</td>
                          <td className="py-3 text-center">
                            {cellAvg > 0 && (
                              <Badge variant={cellAvg >= 90 ? "default" : cellAvg < 75 ? "destructive" : "secondary"}>
                                {cellAvg >= 90 ? "With Honors" : cellAvg < 75 ? "Failed" : "Passed"}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Principal: school-wide overview ────────────────────── */
function PrincipalGradeOverview() {
  const sectionsQuery = useSections();
  const learnersQuery = useLearners();

  const apiSections = sectionsQuery.data?.results ?? [];
  const apiLearners = learnersQuery.data?.results ?? [];
  const hasApiData = apiSections.length > 0 || apiLearners.length > 0;

  const learnerList = hasApiData
    ? apiLearners.map(l => ({ gpa: Number(l.gpa ?? 0), section: l.section }))
    : allLearners.map(l => ({ gpa: l.learner.gpa, section: l.section.id as unknown as number }));

  const sectionList = hasApiData
    ? apiSections.map(s => ({
        id: s.id,
        label: s.label,
        adviser: s.adviser_name ?? '—',
        enrolled: s.enrollment_count,
      }))
    : allSections.map(s => ({
        id: s.section.id as unknown as number,
        label: s.label,
        adviser: s.section.adviser,
        enrolled: s.enrolled,
      }));

  const sectionAvgs = sectionList.map(s => {
    const sLearners = learnerList.filter(l => l.section === s.id);
    const avg = sLearners.length
      ? sLearners.reduce((a, l) => a + l.gpa, 0) / sLearners.length
      : 0;
    return { name: s.label.split(" - ").slice(1).join("-") || s.label, avg: Number(avg.toFixed(1)), below: avg < 75 };
  });

  const schoolAvg = learnerList.length
    ? learnerList.reduce((a, l) => a + l.gpa, 0) / learnerList.length
    : 0;
  const above90 = learnerList.filter(l => l.gpa >= 90).length;
  const below75 = learnerList.filter(l => l.gpa < 75).length;
  
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [distributionOpen, setDistributionOpen] = useState(false);

  // Mock audit log data
  const auditLogs = [
    { date: "May 10, 2026 2:30 PM", user: "Ms. Aurora Aquino", action: "Updated", student: "Juan M. Dela Cruz", subject: "Math Q3", oldGrade: 91, newGrade: 92, reason: "Corrected calculation error" },
    { date: "May 9, 2026 4:15 PM", user: "Mr. Roberto Santos", action: "Updated", student: "Carlo P. Villanueva", subject: "Science Q3", oldGrade: 82, newGrade: 83, reason: "Added bonus points" },
    { date: "May 8, 2026 10:20 AM", user: "Ms. Elena Reyes", action: "Updated", student: "Bea L. Soriano", subject: "English Q3", oldGrade: 87, newGrade: 88, reason: "Rechecked essay score" },
  ];

  const distribution = [
    { range: "90-100", count: above90, color: "var(--color-chart-2)" },
    { range: "85-89", count: learnerList.filter(l => l.gpa >= 85 && l.gpa < 90).length, color: "var(--color-chart-1)" },
    { range: "80-84", count: learnerList.filter(l => l.gpa >= 80 && l.gpa < 85).length, color: "var(--color-chart-3)" },
    { range: "75-79", count: learnerList.filter(l => l.gpa >= 75 && l.gpa < 80).length, color: "var(--color-chart-4)" },
    { range: "Below 75", count: below75, color: "var(--color-destructive)" },
  ];

  return (
    <>
      <PageHeader title="Grades" subtitle={`School-wide overview · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "School Avg GPA", value: schoolAvg.toFixed(1), accent: "text-chart-1" },
            { label: "With Honors (≥90)", value: above90, accent: "text-chart-2" },
            { label: "At Risk (<75)", value: below75, accent: "text-destructive" },
            { label: "Sections Tracked", value: sectionList.length, accent: "text-chart-3" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Average GPA by Section</CardTitle>
              <p className="text-xs text-muted-foreground">3rd Quarter · passing mark 75</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDistributionOpen(true)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Distribution
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAuditLogOpen(true)}
              >
                <History className="mr-2 h-4 w-4" />
                Audit Log
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionAvgs} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} angle={-20} textAnchor="end" height={45} />
                <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}`, "Avg GPA"]}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} name="Avg GPA">
                  {sectionAvgs.map((s, i) => (
                    <Cell key={i} fill={s.below ? "var(--color-destructive)" : "var(--color-chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Section GPA Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Adviser</TableHead>
                    <TableHead className="text-center">Learners</TableHead>
                    <TableHead className="text-right">Avg GPA</TableHead>
                    <TableHead className="text-right">Highest</TableHead>
                    <TableHead className="text-right">Lowest</TableHead>
                    <TableHead>Standing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionList.map((s) => {
                    const sLearners = learnerList.filter(l => l.section === s.id);
                    const gpas = sLearners.map(l => l.gpa);
                    const avg = gpas.length ? gpas.reduce((a, v) => a + v, 0) / gpas.length : 0;
                    const high = gpas.length ? Math.max(...gpas) : 0;
                    const low = gpas.length ? Math.min(...gpas) : 0;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium whitespace-nowrap">{s.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{s.adviser}</TableCell>
                        <TableCell className="text-center">{s.enrolled}</TableCell>
                        <TableCell className={`text-right font-semibold ${avg < 75 ? "text-destructive" : ""}`}>{avg.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-chart-2 font-semibold">{high || '—'}</TableCell>
                        <TableCell className={`text-right font-semibold ${low < 75 && low > 0 ? "text-destructive" : ""}`}>{low || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={avg < 75 ? "destructive" : avg >= 90 ? "default" : "secondary"}>
                            {avg >= 90 ? "With Honors" : avg >= 75 ? "Passing" : "Needs Attention"}
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

        {/* Audit Log Sheet */}
        <Sheet open={auditLogOpen} onOpenChange={setAuditLogOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Grade Audit Log</SheetTitle>
              <p className="text-sm text-muted-foreground">Recent grade changes and modifications</p>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {auditLogs.map((log, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-xs text-muted-foreground">{log.date}</span>
                        </div>
                        <p className="text-sm font-medium">{log.student} · {log.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">By: {log.user}</p>
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Old: <span className="font-semibold">{log.oldGrade}</span></span>
                          <span>→</span>
                          <span className="text-muted-foreground">New: <span className="font-semibold text-chart-2">{log.newGrade}</span></span>
                        </div>
                        {log.reason && (
                          <p className="mt-2 text-xs text-muted-foreground italic">Reason: {log.reason}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Grade Distribution Dialog */}
        <Dialog open={distributionOpen} onOpenChange={setDistributionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Grade Distribution Analysis</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="range" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {distribution.map((d) => (
                  <div key={d.range} className="text-center">
                    <div className="h-2 rounded-full mb-2" style={{ background: d.color }} />
                    <p className="text-xs font-medium">{d.range}</p>
                    <p className="text-lg font-bold">{d.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {learnerList.length > 0 ? ((d.count / learnerList.length) * 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDistributionOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                toast.success("Distribution report exported");
                setDistributionOpen(false);
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

/* ─── Teacher: grade book — API-wired ────────────────────── */
function TeacherGradeBook() {
  const sectionsQuery = useSections();
  const mySection = sectionsQuery.data?.results[0] ?? null;
  const sectionId = mySection?.id ?? null;

  const learnersQuery = useLearners(sectionId != null ? { section: sectionId } : undefined);
  const learners = learnersQuery.data?.results ?? [];

  const subjectsQuery = useSubjects(sectionId ?? undefined);
  const subjects = subjectsQuery.data?.results ?? [];

  const gradesQuery = useGradesBySection(sectionId);
  const allGradesData = gradesQuery.data?.results ?? [];

  const isLoading = sectionsQuery.isLoading || learnersQuery.isLoading || subjectsQuery.isLoading;

  // grade map: learnerId → subjectId → quarter → Grade
  const gradeMap = useMemo(() => {
    const map: Record<number, Record<number, Record<number, Grade>>> = {};
    for (const g of allGradesData) {
      if (!map[g.learner]) map[g.learner] = {};
      if (!map[g.learner][g.subject]) map[g.learner][g.subject] = {};
      map[g.learner][g.subject][g.quarter] = g;
    }
    return map;
  }, [allGradesData]);

  const getGrade = (lid: number, sid: number, q: number) => gradeMap[lid]?.[sid]?.[q];

  const CURRENT_Q = 3;

  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const upsertGrade = useUpsertGrade();

  function enterEditMode() {
    const init: Record<string, string> = {};
    for (const l of learners) {
      for (const s of subjects) {
        const g = getGrade(l.id, s.id, CURRENT_Q);
        init[`${l.id}-${s.id}`] = String(g?.computed_grade != null ? Number(g.computed_grade) : 85);
      }
    }
    setEdits(init);
    setEditMode(true);
  }

  async function handleSave() {
    setSaving(true);
    const changed = Object.entries(edits).filter(([key, val]) => {
      const [lid, sid] = key.split("-").map(Number);
      const existing = getGrade(lid, sid, CURRENT_Q)?.computed_grade;
      return String(existing != null ? Number(existing) : 85) !== val;
    });

    if (changed.length === 0) {
      toast.info("No changes to save");
      setEditMode(false);
      setSaving(false);
      return;
    }

    try {
      await Promise.all(
        changed.map(([key, val]) => {
          const [lid, sid] = key.split("-").map(Number);
          const existing = getGrade(lid, sid, CURRENT_Q);
          const v = Math.min(100, Math.max(0, Number(val) || 0));
          return upsertGrade.mutateAsync({
            id: existing?.id ?? null,
            data: {
              learner: lid,
              subject: sid,
              quarter: CURRENT_Q,
              quiz_score: v,
              exam_score: v,
              activity_score: v,
            },
          });
        })
      );
      toast.success(`${changed.length} grade${changed.length !== 1 ? "s" : ""} saved`, {
        description: "Changes recorded in the database",
      });
      setEditMode(false);
    } catch {
      toast.error("Failed to save grades", { description: "Please try again" });
    } finally {
      setSaving(false);
    }
  }

  // Quarter comparison data computed from API grades
  const quarterComparison = subjects.map((s) => {
    const avg = (q: number) => {
      const vals = learners
        .map((l) => {
          if (q === CURRENT_Q && editMode) {
            const k = `${l.id}-${s.id}`;
            return edits[k] != null ? Number(edits[k]) : null;
          }
          const g = getGrade(l.id, s.id, q);
          return g?.computed_grade != null ? Number(g.computed_grade) : null;
        })
        .filter((v): v is number => v !== null);
      return vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : 0;
    };
    const shortName = s.name.length > 9 ? s.name.substring(0, 8) + "…" : s.name;
    return { subject: shortName, Q1: +avg(1).toFixed(1), Q2: +avg(2).toFixed(1), Q3: +avg(3).toFixed(1) };
  });

  if (isLoading) {
    return (
      <>
        <PageHeader title="Grades" subtitle="Loading grade book…" />
        <main className="p-6">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      </>
    );
  }

  const sectionLabel = mySection?.label ?? "My Section";

  return (
    <>
      <PageHeader title="Grades" subtitle={`${sectionLabel} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base">Grade Book — {sectionLabel}</CardTitle>
              <p className="text-xs text-muted-foreground">Q1–Q3 · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button variant="outline" size="sm" onClick={() => setComparisonOpen(true)}>
                <TrendingUp className="h-4 w-4" /> Compare Quarters
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" /> Import CSV
              </Button>
              {editMode ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    style={{ background: "var(--gradient-accent)" }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={enterEditMode}
                  disabled={subjects.length === 0 || learners.length === 0}
                >
                  Edit Q{CURRENT_Q}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No subjects found for this section.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-ui text-xs uppercase tracking-wide text-muted-foreground min-w-[140px]">
                        Learner
                      </th>
                      {subjects.map((s) => (
                        <th
                          key={s.id}
                          colSpan={3}
                          className="pb-1 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground border-l border-border/40 px-1"
                        >
                          {s.name}
                        </th>
                      ))}
                      <th className="pb-3 text-right font-ui text-xs uppercase tracking-wide text-muted-foreground pl-2">
                        GPA
                      </th>
                    </tr>
                    <tr className="border-b">
                      <th className="pb-2" />
                      {subjects.flatMap((s) =>
                        ["Q1", "Q2", "Q3"].map((q) => (
                          <th
                            key={`${s.id}-${q}`}
                            className="pb-2 text-center font-ui text-[10px] text-muted-foreground border-l border-border/20"
                          >
                            {q}
                          </th>
                        ))
                      )}
                      <th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {learners.map((l) => {
                      const q3Vals = subjects
                        .map((s) => {
                          const key = `${l.id}-${s.id}`;
                          if (editMode && edits[key] !== undefined) return Number(edits[key]);
                          const g = getGrade(l.id, s.id, CURRENT_Q);
                          return g?.computed_grade != null ? Number(g.computed_grade) : null;
                        })
                        .filter((v): v is number => v !== null);
                      const gpa = q3Vals.length ? q3Vals.reduce((a, v) => a + v, 0) / q3Vals.length : 0;

                      return (
                        <tr key={l.id} className="hover:bg-muted/30">
                          <td className="py-3 font-medium whitespace-nowrap pr-3">{l.full_name}</td>
                          {subjects.flatMap((s) => {
                            const key = `${l.id}-${s.id}`;
                            const q1Val = getGrade(l.id, s.id, 1)?.computed_grade;
                            const q2Val = getGrade(l.id, s.id, 2)?.computed_grade;
                            const rawQ3 = getGrade(l.id, s.id, CURRENT_Q)?.computed_grade;
                            const q3Display =
                              editMode && edits[key] !== undefined
                                ? Number(edits[key])
                                : rawQ3 != null
                                ? Number(rawQ3)
                                : null;
                            return [
                              <td key={`${s.id}-q1`} className="py-3 text-center text-muted-foreground border-l border-border/20 px-2">
                                {q1Val != null ? Number(q1Val) : "—"}
                              </td>,
                              <td key={`${s.id}-q2`} className="py-3 text-center text-muted-foreground px-2">
                                {q2Val != null ? Number(q2Val) : "—"}
                              </td>,
                              <td key={`${s.id}-q3`} className="py-3 text-center px-1">
                                {editMode ? (
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={edits[key] ?? ""}
                                    onChange={(e) =>
                                      setEdits((p) => ({ ...p, [key]: e.target.value }))
                                    }
                                    onBlur={(e) => {
                                      const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                      setEdits((p) => ({ ...p, [key]: String(v) }));
                                    }}
                                    className="h-7 w-14 text-center text-xs"
                                  />
                                ) : (
                                  <span
                                    className={`font-semibold ${
                                      q3Display != null && q3Display < 75
                                        ? "text-destructive"
                                        : q3Display != null && q3Display >= 90
                                        ? "text-chart-2"
                                        : ""
                                    }`}
                                  >
                                    {q3Display != null ? q3Display : "—"}
                                  </span>
                                )}
                              </td>,
                            ];
                          })}
                          <td
                            className={`py-3 text-right font-bold pl-3 ${
                              gpa > 0 && gpa < 75 ? "text-destructive" : gpa >= 90 ? "text-chart-2" : ""
                            }`}
                          >
                            {gpa > 0 ? gpa.toFixed(1) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {learners.length === 0 && (
                      <tr>
                        <td
                          colSpan={subjects.length * 3 + 2}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No learners found in this section.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quarter Comparison Dialog */}
        <Dialog open={comparisonOpen} onOpenChange={setComparisonOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quarter-to-Quarter Comparison</DialogTitle>
              <p className="text-sm text-muted-foreground">Class average trends by subject</p>
            </DialogHeader>
            <div className="py-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                      }}
                    />
                    <Line type="monotone" dataKey="Q1" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Q2" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Q3" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {["Q1", "Q2", "Q3"].map((q) => {
                  const avg = quarterComparison.length
                    ? quarterComparison.reduce((sum, s) => sum + (s[q as keyof typeof s] as number), 0) /
                      quarterComparison.length
                    : 0;
                  return (
                    <div key={q} className="text-center p-3 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">{q} Average</p>
                      <p className="text-2xl font-bold">{avg > 0 ? avg.toFixed(1) : "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComparisonOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

/* ─── Student: full transcript ────────────────────────────── */
function StudentTranscript() {
  const { data: myLearner } = useMyLearner();
  const { data: apiGrades = [] } = useLearnerGrades(myLearner?.id ?? null);

  const gradesBySubject = apiGrades.reduce<Record<string, { q1: number | null; q2: number | null; q3: number | null; q4: number | null }>>(
    (acc, g) => {
      if (!acc[g.subject_name]) acc[g.subject_name] = { q1: null, q2: null, q3: null, q4: null };
      if (g.quarter === 1) acc[g.subject_name].q1 = g.computed_grade;
      if (g.quarter === 2) acc[g.subject_name].q2 = g.computed_grade;
      if (g.quarter === 3) acc[g.subject_name].q3 = g.computed_grade;
      if (g.quarter === 4) acc[g.subject_name].q4 = g.computed_grade;
      return acc;
    },
    {}
  );
  const transcript = Object.entries(gradesBySubject).map(([subject, g]) => ({ subject, ...g }));

  const avgVals = transcript.map(s => {
    const vals = [s.q1, s.q2, s.q3, s.q4].filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, v) => a + v, 0) / vals.length : 0;
  }).filter(v => v > 0);
  const avg = avgVals.length > 0 ? avgVals.reduce((a, v) => a + v, 0) / avgVals.length : 0;

  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const handleDownloadReportCard = () => {
    toast.success("Report card downloaded", {
      description: `ReportCard_Q3_${myLearner?.full_name?.replace(/\s+/g, '') ?? 'Student'}.pdf`,
    });
    setReportCardOpen(false);
  };

  const subjectAnalysis = transcript.map(s => {
    const vals = [s.q1, s.q2, s.q3].filter((v): v is number => v !== null);
    const current = s.q3 ?? s.q2 ?? s.q1 ?? 0;
    const cellAvg = vals.length > 0 ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : 0;
    const trend = s.q3 !== null && s.q2 !== null ? s.q3 - s.q2 : 0;
    return {
      subject: s.subject,
      current,
      average: cellAvg,
      trend,
      status: current >= 90 ? "Excellent" : current >= 85 ? "Very Good" : current >= 80 ? "Good" : current >= 75 ? "Fair" : "Needs Improvement",
    };
  });

  return (
    <>
      <PageHeader title="My Grades" subtitle={`${myLearner?.full_name ?? "—"} · ${myLearner?.section_label ?? "—"} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "General Average", value: avg > 0 ? avg.toFixed(1) : "—", accent: "text-chart-1" },
            { label: "With Honors", value: avg >= 90 ? "Yes" : avg > 0 ? "No" : "—", accent: avg >= 90 ? "text-chart-2" : "text-muted-foreground" },
            { label: "Subjects", value: transcript.length || "—", accent: "text-chart-3" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4" /> Academic Transcript — SY {SCHOOL_YEAR}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{myLearner?.section_label ?? "—"} · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setAnalysisOpen(true)}>
                <BarChart3 className="mr-2 h-4 w-4" /> Analysis
              </Button>
              <Button size="sm" onClick={() => setReportCardOpen(true)}>
                <Download className="mr-2 h-4 w-4" /> Report Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transcript.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No grade records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {["Subject", "Q1", "Q2", "Q3 (Current)", "Q4", "Average", "Remarks"].map((h) => (
                        <th key={h} className={`pb-3 font-ui text-xs uppercase tracking-wide text-muted-foreground ${h === "Subject" ? "text-left" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transcript.map((s) => {
                      const vals = [s.q1, s.q2, s.q3, s.q4].filter((v): v is number => v !== null);
                      const cellAvg = vals.length > 0 ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : 0;
                      const passed = cellAvg >= 75;
                      return (
                        <tr key={s.subject} className="hover:bg-muted/30">
                          <td className="py-3 font-semibold">{s.subject}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q1 ?? "—"}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q2 ?? "—"}</td>
                          <td className="py-3 text-center font-bold text-foreground">{s.q3 ?? "—"}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q4 ?? "—"}</td>
                          <td className={`py-3 text-center font-semibold ${cellAvg >= 90 ? "text-chart-2" : !passed && cellAvg > 0 ? "text-destructive" : ""}`}>
                            {cellAvg || "—"}
                          </td>
                          <td className="py-3 text-center">
                            {cellAvg > 0 && (
                              <Badge variant={!passed ? "destructive" : cellAvg >= 90 ? "default" : "secondary"}>
                                {!passed ? "Failed" : cellAvg >= 90 ? "With Honors" : "Passed"}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {avg > 0 && (
                    <tfoot>
                      <tr className="border-t-2">
                        <td className="pt-3 font-ui text-xs uppercase tracking-wide text-muted-foreground" colSpan={5}>General Average</td>
                        <td className="pt-3 text-center text-lg font-bold text-chart-2">{avg.toFixed(1)}</td>
                        <td className="pt-3 text-center">
                          <Badge>{avg >= 90 ? "With Honors" : "Passed"}</Badge>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {transcript.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" /> Quarter Trend</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transcript.map((s) => ({ subject: s.subject, Q1: s.q1 ?? 0, Q2: s.q2 ?? 0, Q3: s.q3 ?? 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="Q1" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} opacity={0.5} />
                  <Bar dataKey="Q2" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Bar dataKey="Q3" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Report Card Dialog */}
        <Dialog open={reportCardOpen} onOpenChange={setReportCardOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Download Report Card</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border p-6 bg-muted/30">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold">{SCHOOL_NAME}</h3>
                  <p className="text-sm text-muted-foreground">School Year {SCHOOL_YEAR}</p>
                  <p className="text-sm text-muted-foreground">3rd Quarter Report Card</p>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Student Name:</span>
                    <span className="font-semibold">{myLearner?.full_name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LRN:</span>
                    <span className="font-mono font-semibold">{myLearner?.lrn ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grade & Section:</span>
                    <span className="font-semibold">{myLearner?.section_label ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">General Average:</span>
                    <span className="text-lg font-bold text-chart-2">{avg > 0 ? avg.toFixed(1) : "—"}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  This report card will be downloaded as a PDF file
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportCardOpen(false)}>Cancel</Button>
              <Button onClick={handleDownloadReportCard}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Performance Analysis Dialog */}
        <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Performance Analysis</DialogTitle>
              <p className="text-sm text-muted-foreground">Detailed breakdown by subject</p>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {subjectAnalysis.map((s) => (
                  <div key={s.subject} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{s.subject}</h4>
                      <Badge variant={s.status === "Excellent" ? "default" : s.status === "Very Good" ? "secondary" : s.status === "Needs Improvement" ? "destructive" : "outline"}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Current (Q3)</p>
                        <p className="text-lg font-bold">{s.current || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Average</p>
                        <p className="text-lg font-bold">{s.average || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Trend</p>
                        <p className={`text-lg font-bold ${s.trend > 0 ? "text-chart-2" : s.trend < 0 ? "text-destructive" : ""}`}>
                          {s.trend > 0 ? "+" : ""}{s.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnalysisOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
