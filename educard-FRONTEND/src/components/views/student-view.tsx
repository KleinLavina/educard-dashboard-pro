import { useState } from "react";
import {
  QrCode, CalendarCheck, BookOpen, Bell, TrendingUp,
  CheckCircle2, AlertTriangle, Clock, MessageCircle,
  GraduationCap, Users, Star, Download,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET } from "@/lib/school-data";
import {
  useMyLearner, useLearnerGrades, useLearnerAttendance,
  useLearnerConduct, useNotifications,
} from "@/lib/use-api";
import type { ConductLog, NotificationRecord } from "@/lib/api";

export function StudentView() {
  const { data: learner, isLoading } = useMyLearner();
  const { data: gradesRaw = [] } = useLearnerGrades(learner?.id ?? null);
  const { data: attendanceRaw = [] } = useLearnerAttendance(learner?.id ?? null);
  const { data: conductRaw = [] } = useLearnerConduct(learner?.id ?? null);
  const { data: notifsRaw = [] } = useNotifications(learner?.id);

  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [gradeDetailOpen, setGradeDetailOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{
    subject_name: string; q1: number | null; q2: number | null; q3: number | null;
  } | null>(null);
  const [notifDetailOpen, setNotifDetailOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);
  const [conductDetailOpen, setConductDetailOpen] = useState(false);
  const [selectedConduct, setSelectedConduct] = useState<ConductLog | null>(null);

  // Group grades by subject name → { q1, q2, q3, q4 }
  const subjectMap: Record<string, { subject_name: string; q1: number | null; q2: number | null; q3: number | null; q4: number | null }> = {};
  for (const g of gradesRaw) {
    if (!subjectMap[g.subject_name]) {
      subjectMap[g.subject_name] = { subject_name: g.subject_name, q1: null, q2: null, q3: null, q4: null };
    }
    const key = `q${g.quarter}` as 'q1' | 'q2' | 'q3' | 'q4';
    subjectMap[g.subject_name][key] = g.computed_grade !== null ? Number(g.computed_grade) : null;
  }
  const subjects = Object.values(subjectMap);

  const currentQ3Avg = subjects.length
    ? subjects.reduce((a, s) => a + (s.q3 ?? 0), 0) / subjects.length
    : 0;

  // Weekly attendance trend from actual records
  const attendanceTrend = (() => {
    const byWeek: Record<string, { present: number; total: number }> = {};
    for (const r of attendanceRaw) {
      const d = new Date(r.date);
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `Wk ${weekNum}`;
      if (!byWeek[key]) byWeek[key] = { present: 0, total: 0 };
      byWeek[key].total++;
      if (r.status === 'present' || r.status === 'late') byWeek[key].present++;
    }
    return Object.entries(byWeek).slice(-6).map(([week, v]) => ({
      week,
      rate: v.total ? Math.round((v.present / v.total) * 100) : 0,
    }));
  })();

  const radarData = subjects.slice(0, 6).map(s => ({
    subject: s.subject_name.split(' ')[0],
    score: s.q3 ?? 0,
  }));

  const isAboveTarget = (learner?.attendance_rate ?? 0) >= SF2_TARGET;

  if (isLoading || !learner) {
    return (
      <>
        <PageHeader title="Student Portal" subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
        <main className="space-y-6 p-4 sm:p-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </main>
      </>
    );
  }

  const fullName = `${learner.first_name} ${learner.middle_initial ? learner.middle_initial + '. ' : ''}${learner.last_name}`;

  return (
    <>
      <PageHeader
        title="Student Portal"
        subtitle={`${fullName} · ${learner.section_label ?? ''} · SY ${SCHOOL_YEAR}`}
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
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">Magandang umaga</p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{fullName}</h2>
              <p className="mt-1 font-mono text-sm opacity-80">LRN: {learner.lrn}</p>
              <p className="mt-2 text-sm opacity-90">
                GPA {currentQ3Avg.toFixed(1)} · Attendance {Number(learner.attendance_rate).toFixed(1)}%
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${isAboveTarget ? "bg-white/25" : "bg-white/20"}`}>
                  {learner.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Subjects</p>
                <p className="text-sm font-semibold">{subjects.length}</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">Status</p>
                <p className="text-sm font-semibold">{learner.status}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "GPA This Quarter", value: currentQ3Avg.toFixed(1), hint: "Current quarter average", icon: BookOpen, accent: "text-chart-1" },
            { label: "Attendance Rate", value: `${Number(learner.attendance_rate).toFixed(1)}%`, hint: `SF2 target ${SF2_TARGET}%`, icon: CalendarCheck, accent: isAboveTarget ? "text-chart-2" : "text-destructive" },
            { label: "Days Recorded", value: String(attendanceRaw.length), hint: "Attendance records", icon: CheckCircle2, accent: "text-chart-2" },
            { label: "Subjects", value: String(subjects.length), hint: "Enrolled this quarter", icon: Star, accent: "text-chart-3" },
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

        {/* Grades + Radar */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">My Grades — Current Quarter</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {["Subject", "Q1", "Q2", "Q3", "Q4", "Avg"].map(h => (
                        <th key={h} className={`pb-2 font-ui text-xs uppercase tracking-wide text-muted-foreground ${h === "Subject" ? "text-left" : h === "Avg" ? "text-right" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {subjects.map((s) => {
                      const vals = [s.q1, s.q2, s.q3].filter((v): v is number => v !== null);
                      const avg = vals.length ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : null;
                      return (
                        <tr key={s.subject_name} className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => { setSelectedSubject(s); setGradeDetailOpen(true); }}>
                          <td className="py-3 font-medium">{s.subject_name}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q1 ?? "—"}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q2 ?? "—"}</td>
                          <td className="py-3 text-center font-semibold">{s.q3 ?? "—"}</td>
                          <td className="py-3 text-center text-muted-foreground">{s.q4 ?? "—"}</td>
                          <td className="py-3 text-right">
                            {avg !== null && (
                              <span className={`font-semibold ${avg >= 90 ? "text-chart-2" : avg < 75 ? "text-destructive" : ""}`}>{avg}</span>
                            )}
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
            <CardHeader><CardTitle className="text-base">Performance Radar</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" fontSize={11} stroke="var(--color-muted-foreground)" />
                  <Radar name="Grade" dataKey="score" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Attendance + Notifications */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Attendance — This Quarter</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {Number(learner.attendance_rate).toFixed(1)}% overall
              </span>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} unit="%" />
                  <Tooltip contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notifsRaw.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSelectedNotif(n); setNotifDetailOpen(true); }}>
                  <div className={`rounded-md p-2 shrink-0 ${n.status === 'sent' ? "bg-chart-2/10 text-chart-2" : "bg-primary/10 text-primary"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug capitalize">{n.triggered_by.replace(/_/g, ' ')}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(n.sent_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {notifsRaw.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>}
            </CardContent>
          </Card>
        </section>

        {/* ID Card + Conduct */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">My Learner ID</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setReportCardOpen(true)}>
                <Download className="mr-2 h-4 w-4" /> Download Report Card
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="px-4 py-3 text-primary-foreground" style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }}>
                  <p className="text-xs uppercase tracking-wide opacity-80">{SCHOOL_NAME}</p>
                  <p className="text-sm font-semibold">Learner Identification Card</p>
                </div>
                <div className="flex gap-4 p-4">
                  <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold">{fullName}</p>
                    <p className="text-sm text-muted-foreground">{learner.section_label}</p>
                    <p className="mt-1 font-ui text-[10px] uppercase tracking-wide text-muted-foreground">LRN</p>
                    <p className="font-mono text-sm font-semibold tracking-wider">{learner.lrn}</p>
                    <p className="text-xs text-muted-foreground">SY {SCHOOL_YEAR}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Scan LRN to verify attendance</p>
                  <button className="flex h-12 w-12 items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors" onClick={() => setQrZoomOpen(true)}>
                    <QrCode className="h-7 w-7" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Conduct Log</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {conductRaw.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSelectedConduct(c); setConductDetailOpen(true); }}>
                  <div className={`rounded-md p-2 shrink-0 ${c.type === "Positive" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"}`}>
                    {c.type === "Positive" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.item}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                      <Badge variant={c.type === "Positive" ? "secondary" : "outline"} className="text-[10px]">{c.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {conductRaw.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No conduct records.</p>}
            </CardContent>
          </Card>
        </section>

        <footer className="flex items-center justify-center gap-2 pt-4 pb-2 text-center font-ui text-xs uppercase tracking-wider text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          EduCard Pro · Student Portal · {SCHOOL_NAME} · SY {SCHOOL_YEAR}
        </footer>

        {/* Report Card Dialog */}
        <Dialog open={reportCardOpen} onOpenChange={setReportCardOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Report Card</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">{SCHOOL_NAME}</h3>
                <p className="text-sm text-muted-foreground">School Year {SCHOOL_YEAR}</p>
                <p className="mt-2 font-semibold">{fullName}</p>
                <p className="text-sm text-muted-foreground">{learner.section_label}</p>
                <p className="text-xs text-muted-foreground">LRN: {learner.lrn}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Q1</TableHead>
                    <TableHead className="text-center">Q2</TableHead>
                    <TableHead className="text-center">Q3</TableHead>
                    <TableHead className="text-center">Q4</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow key={s.subject_name}>
                      <TableCell className="font-medium">{s.subject_name}</TableCell>
                      <TableCell className="text-center">{s.q1 ?? "—"}</TableCell>
                      <TableCell className="text-center">{s.q2 ?? "—"}</TableCell>
                      <TableCell className="text-center font-semibold">{s.q3 ?? "—"}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{s.q4 ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-xs text-muted-foreground text-center border-t pt-4">
                <p>Attendance Rate: {Number(learner.attendance_rate).toFixed(1)}%</p>
                <p className="mt-1">Status: {learner.status}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportCardOpen(false)}>Close</Button>
              <Button onClick={() => { toast.success("Report card PDF downloaded"); setReportCardOpen(false); }}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grade Detail Dialog */}
        <Dialog open={gradeDetailOpen} onOpenChange={setGradeDetailOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{selectedSubject?.subject_name ?? "Subject"} — Grade Details</DialogTitle></DialogHeader>
            {selectedSubject && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-3">
                  {(["q1", "q2", "q3"] as const).map((q) => (
                    <div key={q} className="rounded-lg border bg-card p-3 text-center">
                      <p className="text-xs text-muted-foreground uppercase">{q}</p>
                      <p className={`text-2xl font-bold ${selectedSubject[q] !== null && selectedSubject[q]! < 75 ? "text-destructive" : selectedSubject[q] !== null && selectedSubject[q]! >= 90 ? "text-chart-2" : ""}`}>
                        {selectedSubject[q] ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button className="w-full" variant="outline" onClick={() => setGradeDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Detail Dialog */}
        <Dialog open={notifDetailOpen} onOpenChange={setNotifDetailOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{selectedNotif ? selectedNotif.triggered_by.replace(/_/g, ' ') : "Notification"}</DialogTitle></DialogHeader>
            {selectedNotif && (
              <div className="space-y-3 py-2">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-sm">{selectedNotif.message}</p>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {new Date(selectedNotif.sent_at).toLocaleString()}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button className="w-full" variant="outline" onClick={() => setNotifDetailOpen(false)}>Dismiss</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Zoom Dialog */}
        <Dialog open={qrZoomOpen} onOpenChange={setQrZoomOpen}>
          <DialogContent className="max-w-xs text-center">
            <DialogHeader><DialogTitle>Your LRN QR Code</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-4 border-primary/30 bg-background p-4">
                <QrCode className="h-32 w-32 text-foreground" />
              </div>
              <div>
                <p className="font-semibold">{fullName}</p>
                <p className="font-mono text-sm text-muted-foreground">{learner.lrn}</p>
              </div>
              <p className="text-xs text-muted-foreground">Scan at the school gate to log attendance automatically.</p>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={() => setQrZoomOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Conduct Detail Dialog */}
        <Dialog open={conductDetailOpen} onOpenChange={setConductDetailOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Conduct Record</DialogTitle></DialogHeader>
            {selectedConduct && (
              <div className="space-y-3 py-2">
                <div className={`flex items-start gap-3 rounded-lg p-3 ${selectedConduct.type === "Positive" ? "bg-chart-2/10" : "bg-muted"}`}>
                  {selectedConduct.type === "Positive"
                    ? <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-semibold">{selectedConduct.item}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedConduct.date}</p>
                    {selectedConduct.recorded_by_name && (
                      <p className="text-xs text-muted-foreground">By: {selectedConduct.recorded_by_name}</p>
                    )}
                  </div>
                </div>
                <Badge variant={selectedConduct.type === "Positive" ? "secondary" : "outline"}>{selectedConduct.type}</Badge>
              </div>
            )}
            <DialogFooter>
              <Button className="w-full" variant="outline" onClick={() => setConductDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
