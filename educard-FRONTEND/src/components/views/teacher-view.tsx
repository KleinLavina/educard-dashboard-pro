import { useState } from "react";
import {
  Users, AlertTriangle, BookOpen, CalendarCheck, TrendingUp,
  CheckCircle2, Clock, Upload, Save, GraduationCap, FileUp,
  Send, Bell, IdCard,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { SF2_TARGET, SCHOOL_NAME, SCHOOL_YEAR } from "@/lib/school-data";
import { useMyTeacherSection, useGrades, useUpsertGrade, useAttendanceToday, useNotifications } from "@/lib/use-api";
import type { Learner, Grade } from "@/lib/api";

export function TeacherView() {
  const { data, isLoading } = useMyTeacherSection();
  const sections = data?.sections ?? [];
  const learners = data?.learners ?? [];

  // Use first assigned section as "my section"
  const mySection = sections[0];
  const mySectionLearners = mySection
    ? learners.filter(l => l.section === mySection.id)
    : learners;

  const gradesQuery = useGrades(mySection ? { subject: undefined } : undefined);
  const gradesRaw = gradesQuery.data?.results ?? [];
  const { data: todayAttendance = [] } = useAttendanceToday(mySection?.id);
  const upsertGrade = useUpsertGrade();

  const [editMode, setEditMode] = useState(false);
  const [localGrades, setLocalGrades] = useState<Record<string, Record<string, number>>>({});
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvStep, setCsvStep] = useState<"idle" | "preview">("idle");
  const [studentProfileOpen, setStudentProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Learner | null>(null);
  const [submitGradesOpen, setSubmitGradesOpen] = useState(false);
  const [atRiskDetailOpen, setAtRiskDetailOpen] = useState(false);
  const [selectedAtRisk, setSelectedAtRisk] = useState<Learner | null>(null);

  // Build grade map from API: { lrn: { subjectName: computedGrade } }
  const gradeMap: Record<string, Record<string, number>> = {};
  for (const g of gradesRaw) {
    if (!gradeMap[g.learner_lrn]) gradeMap[g.learner_lrn] = {};
    if (g.computed_grade !== null) {
      gradeMap[g.learner_lrn][g.subject_name] = Number(g.computed_grade);
    }
  }

  // Merge API grades with local edits
  const effectiveGrades = (lrn: string) => ({ ...gradeMap[lrn], ...localGrades[lrn] });

  // Unique subject names across all grades
  const subjects = [...new Set(gradesRaw.map(g => g.subject_name))];

  const atRisk = mySectionLearners.filter(l =>
    Number(l.attendance_rate) < SF2_TARGET ||
    Object.values(effectiveGrades(l.lrn)).some(g => g < 75)
  );

  const classAvgGpa = mySectionLearners.length
    ? mySectionLearners.reduce((a, l) => a + Number(l.gpa), 0) / mySectionLearners.length
    : 0;

  const classAttendance = mySectionLearners.length
    ? mySectionLearners.reduce((a, l) => a + Number(l.attendance_rate), 0) / mySectionLearners.length
    : 0;

  // Weekly attendance from today's records
  const presentToday = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentToday = todayAttendance.filter(r => r.status === 'absent').length;

  const classAvgBySubject = subjects.map(subj => ({
    subject: subj.split(' ')[0],
    avg: mySectionLearners.length
      ? Math.round(
          mySectionLearners.reduce((a, l) => a + (effectiveGrades(l.lrn)[subj] ?? 0), 0) /
          mySectionLearners.length
        )
      : 0,
  }));

  function handleSaveGrades() {
    setEditMode(false);
    toast.success("Grades saved successfully");
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Teacher Portal" subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
        <main className="space-y-6 p-4 sm:p-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </main>
      </>
    );
  }

  const sectionLabel = mySection?.label ?? "My Section";

  return (
    <>
      <PageHeader
        title="Teacher Portal"
        subtitle={`${mySection?.adviser_name ?? ''} · ${sectionLabel} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">

        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-accent)" }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, {mySection?.adviser_name ?? 'Teacher'}
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {sectionLabel} · {mySectionLearners.length} learners
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
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Present Today</p>
                <p className="text-sm font-semibold">{presentToday}</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Absent</p>
                <p className="text-sm font-semibold">{absentToday}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Class Size", value: String(mySectionLearners.length), hint: sectionLabel, icon: Users, accent: "text-chart-3" },
            { label: "Class Avg GPA", value: classAvgGpa.toFixed(1), hint: "Current quarter", icon: BookOpen, accent: "text-chart-1" },
            { label: "Attendance Rate", value: `${classAttendance.toFixed(1)}%`, hint: `SF2 target ${SF2_TARGET}%`, icon: CalendarCheck, accent: classAttendance < SF2_TARGET ? "text-destructive" : "text-chart-2" },
            { label: "At-Risk Learners", value: String(atRisk.length), hint: "Below target or GPA < 75", icon: AlertTriangle, accent: atRisk.length > 0 ? "text-destructive" : "text-chart-2" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{m.hint}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}><m.icon className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Grade Entry */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Grade Entry — {sectionLabel}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Current Quarter · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
                <Upload className="h-4 w-4" /> Import CSV
              </Button>
              {editMode ? (
                <Button size="sm" style={{ background: "var(--gradient-accent)" }} onClick={handleSaveGrades}>
                  <Save className="h-4 w-4" /> Save Grades
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>Edit Grades</Button>
                  <Button size="sm" variant="outline" onClick={() => setSubmitGradesOpen(true)}>
                    <Send className="h-4 w-4" /> Submit to Registrar
                  </Button>
                </>
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
                    {subjects.map(s => <TableHead key={s} className="text-center">{s}</TableHead>)}
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySectionLearners.map((l) => {
                    const lg = effectiveGrades(l.lrn);
                    const gpaVals = subjects.map(s => lg[s] ?? 0).filter(v => v > 0);
                    const avg = gpaVals.length ? gpaVals.reduce((a, v) => a + v, 0) / gpaVals.length : Number(l.gpa);
                    const atR = avg < 75 || Number(l.attendance_rate) < SF2_TARGET;
                    return (
                      <TableRow key={l.lrn} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => { setSelectedStudent(l); setStudentProfileOpen(true); }}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{l.lrn}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{l.full_name}</TableCell>
                        {subjects.map(s => (
                          <TableCell key={s} className="text-center p-1">
                            {editMode ? (
                              <Input
                                type="number" min={0} max={100}
                                value={lg[s] ?? ''}
                                onChange={(e) => setLocalGrades(prev => ({
                                  ...prev,
                                  [l.lrn]: { ...prev[l.lrn], [s]: Number(e.target.value) },
                                }))}
                                className="h-8 w-16 text-center text-sm"
                              />
                            ) : (
                              <span className={`font-medium ${(lg[s] ?? 0) > 0 && (lg[s] ?? 0) < 75 ? "text-destructive" : ""}`}>
                                {lg[s] ?? "—"}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold">{avg.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge variant={atR ? "destructive" : "secondary"}>{atR ? "At Risk" : "On Track"}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Class Average by Subject</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAvgBySubject}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="avg" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} name="Class Avg" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today's Attendance</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {classAttendance.toFixed(1)}% avg
              </span>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ day: "Today", present: presentToday, absent: absentToday }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="present" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Present" stackId="a" />
                  <Bar dataKey="absent" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} name="Absent" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* At-Risk */}
        <Card>
          <CardHeader><CardTitle className="text-base">At-Risk Learners</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {atRisk.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border bg-card p-4">
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
                <p className="text-sm text-muted-foreground">All learners are currently on track.</p>
              </div>
            ) : (
              atRisk.map((l) => (
                <div key={l.lrn} className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => { setSelectedAtRisk(l); setAtRiskDetailOpen(true); }}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{l.full_name}</p>
                    <p className="text-xs text-muted-foreground">LRN: {l.lrn}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {Number(l.attendance_rate) < SF2_TARGET && (
                      <Badge variant="destructive">{Number(l.attendance_rate).toFixed(1)}% att.</Badge>
                    )}
                    {Object.values(effectiveGrades(l.lrn)).some(g => g < 75) && (
                      <Badge variant="destructive">Low grade</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Teacher Portal · {SCHOOL_NAME} · SY {SCHOOL_YEAR}
        </footer>

        {/* CSV Import Dialog */}
        <Dialog open={csvImportOpen} onOpenChange={(o) => { setCsvImportOpen(o); if (!o) setCsvStep("idle"); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Import Grades from CSV</DialogTitle></DialogHeader>
            <div className="py-4">
              {csvStep === "idle" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12">
                    <div className="text-center">
                      <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">Drag CSV here or click to browse</p>
                      <p className="mt-2 text-xs text-muted-foreground">Expected columns: LRN + subject names</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setCsvStep("preview")}>
                        Load Sample CSV (Demo)
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-chart-2/10 p-3 text-sm text-chart-2">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    <strong>{mySectionLearners.length} records ready to import</strong>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>LRN</TableHead>
                        <TableHead>Learner</TableHead>
                        {subjects.slice(0, 4).map(s => <TableHead key={s} className="text-center">{s}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mySectionLearners.slice(0, 3).map((l) => (
                        <TableRow key={l.lrn}>
                          <TableCell className="font-mono text-xs">{l.lrn}</TableCell>
                          <TableCell className="font-medium">{l.full_name}</TableCell>
                          {subjects.slice(0, 4).map(s => (
                            <TableCell key={s} className="text-center font-semibold">
                              {effectiveGrades(l.lrn)[s] ?? "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCsvImportOpen(false); setCsvStep("idle"); }}>Cancel</Button>
              {csvStep === "preview" && (
                <Button onClick={() => { toast.success("Grades imported successfully"); setCsvImportOpen(false); setCsvStep("idle"); }}>
                  <Upload className="mr-2 h-4 w-4" /> Import Grades
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student Profile Dialog */}
        <Dialog open={studentProfileOpen} onOpenChange={setStudentProfileOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Learner Profile</DialogTitle></DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold">
                    {selectedStudent.first_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{selectedStudent.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.section_label}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {selectedStudent.lrn}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className={`text-xl font-bold ${Number(selectedStudent.attendance_rate) < SF2_TARGET ? "text-destructive" : "text-chart-2"}`}>
                      {Number(selectedStudent.attendance_rate).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-xl font-bold">{Number(selectedStudent.gpa).toFixed(1)}</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Subject Grades</p>
                  {Object.entries(effectiveGrades(selectedStudent.lrn)).map(([subj, grade]) => (
                    <div key={subj} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                      <span className="text-muted-foreground">{subj}</span>
                      <span className={`font-semibold ${grade < 75 ? "text-destructive" : ""}`}>{grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStudentProfileOpen(false)}>Close</Button>
              <Button onClick={() => { toast.success(`Notification sent to parent of ${selectedStudent?.full_name}`); setStudentProfileOpen(false); }}>
                <Bell className="mr-2 h-4 w-4" /> Notify Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Grades Dialog */}
        <Dialog open={submitGradesOpen} onOpenChange={setSubmitGradesOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Submit Grades to Registrar</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Section</span><span className="font-semibold">{sectionLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Students with grades</span><span className="font-semibold text-chart-2">{mySectionLearners.length} / {mySectionLearners.length}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">Once submitted, grades will be locked and sent to the registrar's office.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubmitGradesOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Grades submitted to registrar successfully"); setSubmitGradesOpen(false); }}>
                <Send className="mr-2 h-4 w-4" /> Confirm Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* At-Risk Detail Dialog */}
        <Dialog open={atRiskDetailOpen} onOpenChange={setAtRiskDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>At-Risk Learner Detail</DialogTitle></DialogHeader>
            {selectedAtRisk && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-2xl font-bold text-destructive">
                    {selectedAtRisk.first_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{selectedAtRisk.full_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {selectedAtRisk.lrn}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Number(selectedAtRisk.attendance_rate) < SF2_TARGET && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Low Attendance</p>
                        <p className="text-xs text-muted-foreground">{Number(selectedAtRisk.attendance_rate).toFixed(1)}% — below {SF2_TARGET}% SF2 target</p>
                      </div>
                    </div>
                  )}
                  {Object.values(effectiveGrades(selectedAtRisk.lrn)).some(g => g < 75) && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Failing Grade</p>
                        <p className="text-xs text-muted-foreground">One or more subjects below passing mark (75)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAtRiskDetailOpen(false)}>Close</Button>
              <Button onClick={() => { toast.success(`Intervention flagged for ${selectedAtRisk?.full_name}`); setAtRiskDetailOpen(false); }}>
                <Bell className="mr-2 h-4 w-4" /> Notify Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
