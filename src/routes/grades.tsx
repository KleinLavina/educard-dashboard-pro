import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET, fullName, allSections, allLearners, gradeRecords } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/grades")({
  component: GradesPage,
  head: () => ({ meta: [{ title: `Grades — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

function GradesPage() {
  const { role } = useRole();
  if (role === "teacher") return <TeacherGradeBook />;
  if (role === "student") return <StudentTranscript />;
  return <PrincipalGradeOverview />;
}

/* ─── Principal: school-wide overview ────────────────────── */
function PrincipalGradeOverview() {
  const sectionAvgs = allSections.map((s) => {
    const avg = s.section.learners.length
      ? s.section.learners.reduce((a, l) => a + l.gpa, 0) / s.section.learners.length
      : 0;
    return { name: s.label.split(" - ").slice(1).join("-") || s.label, avg: Number(avg.toFixed(1)), below: avg < 75 };
  });

  const schoolAvg = allLearners.reduce((a, l) => a + l.learner.gpa, 0) / allLearners.length;
  const above90 = allLearners.filter((l) => l.learner.gpa >= 90).length;
  const below75 = allLearners.filter((l) => l.learner.gpa < 75).length;
  
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [distributionOpen, setDistributionOpen] = useState(false);

  // Mock audit log data
  const auditLogs = [
    { date: "May 10, 2026 2:30 PM", user: "Ms. Aurora Aquino", action: "Updated", student: "Juan M. Dela Cruz", subject: "Math Q3", oldGrade: 91, newGrade: 92, reason: "Corrected calculation error" },
    { date: "May 9, 2026 4:15 PM", user: "Mr. Roberto Santos", action: "Updated", student: "Carlo P. Villanueva", subject: "Science Q3", oldGrade: 82, newGrade: 83, reason: "Added bonus points" },
    { date: "May 8, 2026 10:20 AM", user: "Ms. Elena Reyes", action: "Updated", student: "Bea L. Soriano", subject: "English Q3", oldGrade: 87, newGrade: 88, reason: "Rechecked essay score" },
  ];

  // Grade distribution data
  const distribution = [
    { range: "90-100", count: above90, color: "var(--color-chart-2)" },
    { range: "85-89", count: allLearners.filter(l => l.learner.gpa >= 85 && l.learner.gpa < 90).length, color: "var(--color-chart-1)" },
    { range: "80-84", count: allLearners.filter(l => l.learner.gpa >= 80 && l.learner.gpa < 85).length, color: "var(--color-chart-3)" },
    { range: "75-79", count: allLearners.filter(l => l.learner.gpa >= 75 && l.learner.gpa < 80).length, color: "var(--color-chart-4)" },
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
            { label: "Sections Tracked", value: allSections.length, accent: "text-chart-3" },
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
                  {allSections.map((s) => {
                    const gpas = s.section.learners.map((l) => l.gpa);
                    const avg = gpas.length ? gpas.reduce((a, v) => a + v, 0) / gpas.length : 0;
                    const high = gpas.length ? Math.max(...gpas) : 0;
                    const low = gpas.length ? Math.min(...gpas) : 0;
                    return (
                      <TableRow key={s.section.id}>
                        <TableCell className="font-medium whitespace-nowrap">{s.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{s.section.adviser}</TableCell>
                        <TableCell className="text-center">{s.enrolled}</TableCell>
                        <TableCell className={`text-right font-semibold ${avg < 75 ? "text-destructive" : ""}`}>{avg.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-chart-2 font-semibold">{high}</TableCell>
                        <TableCell className={`text-right font-semibold ${low < 75 ? "text-destructive" : ""}`}>{low}</TableCell>
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
                      {((d.count / allLearners.length) * 100).toFixed(1)}%
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

/* ─── Teacher: 4-quarter grade book ──────────────────────── */
const SUBJECTS = ["Math", "Science", "English", "Filipino", "AP", "MAPEH"];

const Q_GRADES: Record<string, Record<string, [number, number, number]>> = {
  "136728140987": { Math: [89, 91, 92], Science: [87, 88, 90], English: [85, 87, 88], Filipino: [91, 93, 94], AP: [88, 90, 91], MAPEH: [93, 94, 95] },
  "136728140988": { Math: [82, 84, 85], Science: [80, 82, 83], English: [84, 86, 87], Filipino: [85, 87, 89], AP: [80, 83, 84], MAPEH: [86, 88, 90] },
  "136728140989": { Math: [87, 89, 90], Science: [89, 91, 92], English: [85, 87, 88], Filipino: [88, 90, 91], AP: [85, 88, 89], MAPEH: [90, 92, 94] },
};

function TeacherGradeBook() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const learners = mySection.section.learners;
  const [editMode, setEditMode] = useState(false);
  const [q3Grades, setQ3Grades] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(learners.map((l) => [l.lrn, Object.fromEntries(SUBJECTS.map((s) => [s, Q_GRADES[l.lrn]?.[s]?.[2] ?? 85]))]))
  );
  const [saved, setSaved] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  function save() { 
    setEditMode(false); 
    setSaved(true);
    toast.success("Grades saved successfully", {
      description: "All changes have been recorded",
    });
  }

  // Quarter comparison data
  const quarterComparison = SUBJECTS.map(subject => {
    const q1Avg = learners.reduce((sum, l) => sum + (Q_GRADES[l.lrn]?.[subject]?.[0] ?? 85), 0) / learners.length;
    const q2Avg = learners.reduce((sum, l) => sum + (Q_GRADES[l.lrn]?.[subject]?.[1] ?? 85), 0) / learners.length;
    const q3Avg = learners.reduce((sum, l) => sum + (q3Grades[l.lrn]?.[subject] ?? 85), 0) / learners.length;
    return { subject, Q1: Number(q1Avg.toFixed(1)), Q2: Number(q2Avg.toFixed(1)), Q3: Number(q3Avg.toFixed(1)) };
  });

  return (
    <>
      <PageHeader title="Grades" subtitle={`${mySection.label} · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Grade Book — {mySection.label}</CardTitle>
              <p className="text-xs text-muted-foreground">All quarters · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setComparisonOpen(true)}>
                <TrendingUp className="h-4 w-4" /> Compare Quarters
              </Button>
              <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import CSV</Button>
              {editMode
                ? <Button size="sm" style={{ background: "var(--gradient-accent)" }} onClick={save}><Save className="h-4 w-4" /> Save</Button>
                : <Button size="sm" variant="outline" onClick={() => { setEditMode(true); setSaved(false); }}>Edit Q3</Button>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-ui text-xs uppercase tracking-wide text-muted-foreground">Learner</th>
                    {SUBJECTS.map((s) => (
                      <th key={s} colSpan={3} className="pb-1 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground border-l border-border/40">{s}</th>
                    ))}
                    <th className="pb-3 text-right font-ui text-xs uppercase tracking-wide text-muted-foreground">GPA</th>
                  </tr>
                  <tr className="border-b">
                    <th className="pb-2" />
                    {SUBJECTS.flatMap((s) => (
                      ["Q1", "Q2", "Q3"].map((q) => (
                        <th key={`${s}-${q}`} className="pb-2 text-center font-ui text-[10px] text-muted-foreground border-l border-border/20 first:border-l-0">
                          {q}
                        </th>
                      ))
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {learners.map((l) => {
                    const allQ3 = SUBJECTS.map((s) => q3Grades[l.lrn]?.[s] ?? 85);
                    const gpa = allQ3.reduce((a, v) => a + v, 0) / allQ3.length;
                    return (
                      <tr key={l.lrn} className="hover:bg-muted/30">
                        <td className="py-3 font-medium whitespace-nowrap pr-3">{fullName(l)}</td>
                        {SUBJECTS.flatMap((s) => {
                          const [q1, q2] = Q_GRADES[l.lrn]?.[s] ?? [85, 85, 85];
                          const q3 = q3Grades[l.lrn]?.[s] ?? 85;
                          return [
                            <td key={`${s}-q1`} className="py-3 text-center text-muted-foreground border-l border-border/20 px-2">{q1}</td>,
                            <td key={`${s}-q2`} className="py-3 text-center text-muted-foreground px-2">{q2}</td>,
                            <td key={`${s}-q3`} className="py-3 text-center px-1">
                              {editMode ? (
                                <Input
                                  type="number" min={0} max={100} value={q3}
                                  onChange={(e) => setQ3Grades((p) => ({ ...p, [l.lrn]: { ...p[l.lrn], [s]: Number(e.target.value) } }))}
                                  className="h-7 w-14 text-center text-xs"
                                />
                              ) : (
                                <span className={`font-semibold ${q3 < 75 ? "text-destructive" : q3 >= 90 ? "text-chart-2" : ""}`}>{q3}</span>
                              )}
                            </td>,
                          ];
                        })}
                        <td className={`py-3 text-right font-bold pl-3 ${gpa < 75 ? "text-destructive" : gpa >= 90 ? "text-chart-2" : ""}`}>
                          {gpa.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {saved && (
              <p className="mt-3 flex items-center gap-2 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" /> Grades saved successfully.
              </p>
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
                    <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="Q1" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Q2" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Q3" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {["Q1", "Q2", "Q3"].map((q, i) => {
                  const avg = quarterComparison.reduce((sum, s) => sum + s[q as keyof typeof s] as number, 0) / quarterComparison.length;
                  return (
                    <div key={q} className="text-center p-3 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">{q} Average</p>
                      <p className="text-2xl font-bold">{avg.toFixed(1)}</p>
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
const STUDENT_TRANSCRIPT = [
  { subject: "Math",     q1: 89, q2: 91, q3: 92, q4: null },
  { subject: "Science",  q1: 87, q2: 88, q3: 90, q4: null },
  { subject: "English",  q1: 85, q2: 87, q3: 88, q4: null },
  { subject: "Filipino", q1: 91, q2: 93, q3: 94, q4: null },
  { subject: "AP",       q1: 88, q2: 90, q3: 91, q4: null },
  { subject: "MAPEH",    q1: 93, q2: 94, q3: 95, q4: null },
];

function StudentTranscript() {
  const avg = STUDENT_TRANSCRIPT.reduce((a, s) => a + (s.q1 + s.q2 + s.q3) / 3, 0) / STUDENT_TRANSCRIPT.length;
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const handleDownloadReportCard = () => {
    toast.success("Report card downloaded", {
      description: "ReportCard_Q3_JuanDelaCruz.pdf",
    });
    setReportCardOpen(false);
  };

  // Subject performance analysis
  const subjectAnalysis = STUDENT_TRANSCRIPT.map(s => ({
    subject: s.subject,
    current: s.q3,
    average: Math.round((s.q1 + s.q2 + s.q3) / 3),
    trend: s.q3 - s.q2,
    status: s.q3 >= 90 ? "Excellent" : s.q3 >= 85 ? "Very Good" : s.q3 >= 80 ? "Good" : s.q3 >= 75 ? "Fair" : "Needs Improvement"
  }));

  return (
    <>
      <PageHeader title="My Grades" subtitle={`Juan M. Dela Cruz · Grade 7 - Sampaguita · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "General Avg (Q3)", value: avg.toFixed(1), accent: "text-chart-1" },
            { label: "With Honors", value: avg >= 90 ? "Yes" : "No", accent: avg >= 90 ? "text-chart-2" : "text-muted-foreground" },
            { label: "Class Rank", value: "#1", accent: "text-chart-2" },
            { label: "Subjects", value: STUDENT_TRANSCRIPT.length, accent: "text-chart-3" },
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
              <p className="text-xs text-muted-foreground">Grade 7 - Sampaguita · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAnalysisOpen(true)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analysis
              </Button>
              <Button
                size="sm"
                onClick={() => setReportCardOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Report Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  {STUDENT_TRANSCRIPT.map((s) => {
                    const cellAvg = Math.round((s.q1 + s.q2 + s.q3) / 3);
                    const passed = cellAvg >= 75;
                    return (
                      <tr key={s.subject} className="hover:bg-muted/30">
                        <td className="py-3 font-semibold">{s.subject}</td>
                        <td className="py-3 text-center text-muted-foreground">{s.q1}</td>
                        <td className="py-3 text-center text-muted-foreground">{s.q2}</td>
                        <td className="py-3 text-center font-bold text-foreground">{s.q3}</td>
                        <td className="py-3 text-center text-muted-foreground">—</td>
                        <td className={`py-3 text-center font-semibold ${cellAvg >= 90 ? "text-chart-2" : !passed ? "text-destructive" : ""}`}>
                          {cellAvg}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={!passed ? "destructive" : cellAvg >= 90 ? "default" : "secondary"}>
                            {!passed ? "Failed" : cellAvg >= 90 ? "With Honors" : "Passed"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td className="pt-3 font-ui text-xs uppercase tracking-wide text-muted-foreground" colSpan={5}>General Average</td>
                    <td className="pt-3 text-center text-lg font-bold text-chart-2">{avg.toFixed(1)}</td>
                    <td className="pt-3 text-center">
                      <Badge>{avg >= 90 ? "With Honors" : "Passed"}</Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" /> Quarter Trend</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STUDENT_TRANSCRIPT.map((s) => ({ subject: s.subject, Q1: s.q1, Q2: s.q2, Q3: s.q3 }))}>
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
                    <span className="font-semibold">Juan M. Dela Cruz</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LRN:</span>
                    <span className="font-mono font-semibold">136728140987</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grade & Section:</span>
                    <span className="font-semibold">Grade 7 - Sampaguita</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">General Average:</span>
                    <span className="text-lg font-bold text-chart-2">{avg.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  This report card will be downloaded as a PDF file
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportCardOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownloadReportCard}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
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
                      <Badge variant={
                        s.status === "Excellent" ? "default" :
                        s.status === "Very Good" ? "secondary" :
                        s.status === "Needs Improvement" ? "destructive" :
                        "outline"
                      }>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Current (Q3)</p>
                        <p className="text-lg font-bold">{s.current}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Average</p>
                        <p className="text-lg font-bold">{s.average}</p>
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
              <Button variant="outline" onClick={() => setAnalysisOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
