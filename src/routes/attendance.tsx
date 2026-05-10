import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp, Download, Calendar, Users, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET, fullName, allSections, allLearners, attendanceLogs } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
  head: () => ({ meta: [{ title: `Attendance — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

function AttendancePage() {
  const { role } = useRole();
  if (role === "teacher") return <TeacherRollCall />;
  if (role === "student") return <StudentAttendance />;
  return <PrincipalSF2 />;
}

/* ─── Principal: SF2 section matrix ─────────────────────── */
function PrincipalSF2() {
  const belowCount = allSections.filter((s) => s.belowTarget).length;
  const overallAtt = allLearners.reduce((a, l) => a + l.learner.attendanceRate, 0) / allLearners.length;
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const selectedSection = selectedSectionId ? allSections.find(s => s.section.id === selectedSectionId) : null;
  const sectionStudents = selectedSection ? selectedSection.section.learners : [];

  const handleExportSF2 = () => {
    toast.success("SF2 Report exported successfully", {
      description: "Downloaded SF2_Report_Q3_2026.pdf",
    });
    setExportDialogOpen(false);
  };

  return (
    <>
      <PageHeader title="SF2 Attendance" subtitle={`Compliance overview · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Campus Avg", value: `${overallAtt.toFixed(1)}%`, accent: "text-chart-2", sub: `SF2 target ${SF2_TARGET}%` },
            { label: "Total Sections", value: allSections.length, accent: "text-chart-3", sub: "All grade levels" },
            { label: "On Target", value: allSections.length - belowCount, accent: "text-chart-2", sub: `≥ ${SF2_TARGET}% attendance` },
            { label: "Below Target", value: belowCount, accent: "text-destructive", sub: `< ${SF2_TARGET}% attendance` },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">SF2 Compliance by Section</CardTitle>
              <p className="text-xs text-muted-foreground">3rd Quarter · Week 6 · Target ≥ {SF2_TARGET}%</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export SF2
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allSections.map((s) => (
                <div 
                  key={s.section.id} 
                  className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${s.belowTarget ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10" : "border-border/60 bg-card hover:bg-muted/40"}`}
                  onClick={() => setSelectedSectionId(s.section.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground">Adviser: {s.section.adviser} · {s.enrolled} learners</p>
                  </div>
                  <div className="hidden sm:block text-right text-sm">
                    <p className="font-ui text-[10px] uppercase text-muted-foreground">SF2 Rate</p>
                    <p className={`text-lg font-bold ${s.belowTarget ? "text-destructive" : "text-chart-2"}`}>{s.attendance.toFixed(1)}%</p>
                  </div>
                  <div className="w-28 hidden md:block">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(s.attendance, 100)}%`,
                          background: s.belowTarget ? "var(--color-destructive)" : "var(--gradient-accent)",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-right font-ui text-[10px] text-muted-foreground">
                      {s.attendance.toFixed(1)}% / {SF2_TARGET}%
                    </p>
                  </div>
                  <Badge variant={s.belowTarget ? "destructive" : "secondary"} className="shrink-0">
                    {s.belowTarget ? "Below Target" : "On Target"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Detail Sheet */}
        <Sheet open={!!selectedSectionId} onOpenChange={(open) => !open && setSelectedSectionId(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {selectedSection && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedSection.label}</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedSection.section.adviser} · {selectedSection.enrolled} students
                  </p>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Section Rate</p>
                          <p className={`text-2xl font-semibold ${selectedSection.belowTarget ? "text-destructive" : "text-chart-2"}`}>
                            {selectedSection.attendance.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">SF2 Target</p>
                          <p className="text-2xl font-semibold">{SF2_TARGET}%</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                          <Badge variant={selectedSection.belowTarget ? "destructive" : "secondary"}>
                            {selectedSection.belowTarget ? "Below Target" : "On Target"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Student Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sectionStudents.map((student) => {
                          const studentLogs = attendanceLogs.filter(log => log.lrn === student.lrn);
                          const presentCount = studentLogs.filter(log => log.status === "present").length;
                          const totalDays = studentLogs.length;
                          const rate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
                          const belowTarget = rate < SF2_TARGET;

                          return (
                            <div key={student.lrn} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{fullName(student)}</p>
                                <p className="text-xs text-muted-foreground">LRN: {student.lrn}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">{presentCount}/{totalDays} days</p>
                                  <p className={`text-sm font-semibold ${belowTarget ? "text-destructive" : "text-chart-2"}`}>
                                    {rate.toFixed(1)}%
                                  </p>
                                </div>
                                <Badge variant={belowTarget ? "destructive" : "secondary"}>
                                  {belowTarget ? "At Risk" : "Good"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Export SF2 Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export SF2 Report</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Generate SF2 (School Form 2) attendance report for 3rd Quarter, SY {SCHOOL_YEAR}.
              </p>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Sections:</span>
                  <span className="font-semibold">{allSections.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Students:</span>
                  <span className="font-semibold">{allLearners.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Campus Average:</span>
                  <span className={`font-semibold ${overallAtt < SF2_TARGET ? "text-destructive" : "text-chart-2"}`}>
                    {overallAtt.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sections Below Target:</span>
                  <span className={`font-semibold ${belowCount > 0 ? "text-destructive" : "text-chart-2"}`}>
                    {belowCount}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportSF2}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

/* ─── Teacher: live roll call ─────────────────────────────── */
const DAYS = ["Mon May 6", "Tue May 7", "Wed May 8", "Thu May 9", "Fri May 10"];

function TeacherRollCall() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const learners = mySection.section.learners;

  const [marks, setMarks] = useState<Record<string, Record<string, "P" | "A">>>(() =>
    Object.fromEntries(
      learners.map((l) => [
        l.lrn,
        Object.fromEntries(DAYS.map((d, i) => [d, i === 1 && l.lrn === "136728140988" ? "A" : "P"])),
      ]),
    ),
  );
  const [saved, setSaved] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkMarkMode, setBulkMarkMode] = useState<"P" | "A" | null>(null);

  function toggle(lrn: string, day: string) {
    setMarks((prev) => ({
      ...prev,
      [lrn]: { ...prev[lrn], [day]: prev[lrn][day] === "P" ? "A" : "P" },
    }));
    setSaved(false);
  }

  const presentToday = learners.filter((l) => marks[l.lrn][DAYS[4]] === "P").length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(learners.map(l => l.lrn)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (lrn: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(lrn);
    } else {
      newSelected.delete(lrn);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkMark = (status: "P" | "A") => {
    if (selectedStudents.size === 0) return;
    
    const today = DAYS[4]; // Friday
    setMarks((prev) => {
      const updated = { ...prev };
      selectedStudents.forEach(lrn => {
        updated[lrn] = { ...updated[lrn], [today]: status };
      });
      return updated;
    });
    
    toast.success(`Marked ${selectedStudents.size} students as ${status === "P" ? "Present" : "Absent"}`);
    setSelectedStudents(new Set());
    setSaved(false);
  };

  return (
    <>
      <PageHeader title="Attendance" subtitle={`${mySection.label} · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Present Today", value: presentToday, icon: CheckCircle2, accent: "text-chart-2" },
            { label: "Absent Today", value: learners.length - presentToday, icon: XCircle, accent: "text-destructive" },
            { label: "SF2 Target", value: `${SF2_TARGET}%`, icon: TrendingUp, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
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
              <CardTitle className="text-base">Weekly Roll Call</CardTitle>
              <p className="text-xs text-muted-foreground">Click a cell to toggle Present ↔ Absent</p>
            </div>
            <Button
              size="sm"
              style={{ background: "var(--gradient-accent)" }}
              onClick={() => setSaved(true)}
            >
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Submit SF2"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left">
                      <Checkbox
                        checked={selectedStudents.size === learners.length && learners.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="pb-3 text-left font-ui text-xs uppercase tracking-wide text-muted-foreground">Learner</th>
                    {DAYS.map((d) => (
                      <th key={d} className="pb-3 text-center font-ui text-xs uppercase tracking-wide text-muted-foreground">
                        {d.split(" ")[0]}
                        <br />
                        <span className="normal-case text-[10px] font-normal">{d.split(" ")[1]}</span>
                      </th>
                    ))}
                    <th className="pb-3 text-right font-ui text-xs uppercase tracking-wide text-muted-foreground">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {learners.map((l) => {
                    const presentDays = DAYS.filter((d) => marks[l.lrn][d] === "P").length;
                    return (
                      <tr key={l.lrn}>
                        <td className="py-3">
                          <Checkbox
                            checked={selectedStudents.has(l.lrn)}
                            onCheckedChange={(checked) => handleSelectStudent(l.lrn, checked as boolean)}
                          />
                        </td>
                        <td className="py-3 font-medium whitespace-nowrap">{fullName(l)}</td>
                        {DAYS.map((d) => {
                          const isPresent = marks[l.lrn][d] === "P";
                          return (
                            <td key={d} className="py-3 text-center">
                              <button
                                onClick={() => toggle(l.lrn, d)}
                                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                                  isPresent
                                    ? "bg-chart-2/15 text-chart-2 hover:bg-chart-2/25"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                }`}
                                title={`${fullName(l)} — ${d}: ${isPresent ? "Present" : "Absent"}`}
                              >
                                {isPresent ? "P" : "A"}
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-3 text-right text-sm font-semibold text-muted-foreground">
                          {presentDays}/{DAYS.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {saved && (
              <p className="mt-3 flex items-center gap-2 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" /> SF2 attendance submitted to registrar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bulk Mark Actions Bar */}
        {selectedStudents.size > 0 && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4">
            <Card className="border-2 shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                  <Checkbox checked={true} />
                  <span className="text-sm font-medium">{selectedStudents.size} selected</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkMark("P")}
                    className="bg-chart-2/10 hover:bg-chart-2/20"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-chart-2" />
                    Mark Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkMark("A")}
                    className="bg-destructive/10 hover:bg-destructive/20"
                  >
                    <XCircle className="mr-2 h-4 w-4 text-destructive" />
                    Mark Absent
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedStudents(new Set())}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}

/* ─── Student: personal history ──────────────────────────── */
const weeks = [
  { week: "Apr 14–18", days: ["P", "P", "P", "P", "P"], rate: 100 },
  { week: "Apr 21–25", days: ["P", "P", "P", "P", "P"], rate: 100 },
  { week: "Apr 28–May 2", days: ["P", "A", "P", "P", "P"], rate: 80 },
  { week: "May 5–9", days: ["P", "P", "P", "P", "P"], rate: 100 },
  { week: "May 12–16", days: ["P", "P", "P", "P", "P"], rate: 100 },
  { week: "May 19–23", days: ["P", "P", "P", "A", "P"], rate: 80 },
];

function StudentAttendance() {
  const totalDays = weeks.length * 5;
  const presentDays = weeks.reduce((a, w) => a + w.days.filter((d) => d === "P").length, 0);
  const rate = ((presentDays / totalDays) * 100).toFixed(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  return (
    <>
      <PageHeader title="My Attendance" subtitle={`Juan M. Dela Cruz · Grade 7 - Sampaguita · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Days Present", value: presentDays, accent: "text-chart-2" },
            { label: "Days Absent", value: totalDays - presentDays, accent: "text-destructive" },
            { label: "Rate", value: `${rate}%`, accent: "text-chart-1" },
            { label: "SF2 Target", value: `${SF2_TARGET}%`, accent: "text-muted-foreground" },
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
              <CardTitle className="text-base">Weekly Attendance Log</CardTitle>
              <p className="text-xs text-muted-foreground">3rd Quarter · {SCHOOL_NAME}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
              <Button
                size="sm"
                variant={viewMode === "calendar" ? "default" : "outline"}
                onClick={() => setViewMode("calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "list" ? (
              <div className="space-y-4">
                {weeks.map((w) => (
                  <div key={w.week} className="flex items-center gap-4">
                    <div className="w-36 shrink-0 text-xs text-muted-foreground">{w.week}</div>
                    <div className="flex gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                        <div key={day} className="flex flex-col items-center gap-1">
                          <span className="font-ui text-[10px] uppercase text-muted-foreground">{day.charAt(0)}</span>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                            w.days[i] === "P" ? "bg-chart-2/15 text-chart-2" : "bg-destructive/10 text-destructive"
                          }`}>
                            {w.days[i]}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden sm:flex flex-1 items-center gap-3">
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${w.rate}%`, background: w.rate >= SF2_TARGET ? "var(--gradient-accent)" : "var(--color-destructive)" }}
                        />
                      </div>
                      <span className={`w-12 text-right text-xs font-semibold ${w.rate < SF2_TARGET ? "text-destructive" : "text-chart-2"}`}>
                        {w.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center font-ui text-xs font-semibold uppercase text-muted-foreground">
                    {day}
                  </div>
                ))}
                {/* Calendar grid - simplified for demo */}
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 1; // Start from day 1
                  const isSchoolDay = dayNum >= 0 && dayNum < 30 && (i % 7 < 5); // Mon-Fri only
                  const weekIndex = Math.floor(dayNum / 5);
                  const dayIndex = dayNum % 5;
                  const status = isSchoolDay && weekIndex < weeks.length ? weeks[weekIndex]?.days[dayIndex] : null;
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold ${
                        !isSchoolDay ? "bg-muted/30 text-muted-foreground/30" :
                        status === "P" ? "bg-chart-2/15 text-chart-2" :
                        status === "A" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {dayNum >= 0 && dayNum < 30 ? dayNum + 1 : ""}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" /> Recent Check-ins</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: "May 10, 2026", time: "7:38 AM", type: "Time-in", status: "On time" },
              { date: "May 9, 2026", time: "7:41 AM", type: "Time-in", status: "On time" },
              { date: "May 8, 2026", time: "7:35 AM", type: "Time-in", status: "On time" },
              { date: "Apr 30, 2026", time: "8:15 AM", type: "Time-in", status: "Late" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <CalendarCheck className={`h-4 w-4 shrink-0 ${r.status === "Late" ? "text-destructive" : "text-chart-2"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.type} — {r.date}</p>
                  <p className="text-xs text-muted-foreground">{r.time} · LRN scan verified</p>
                </div>
                <Badge variant={r.status === "Late" ? "destructive" : "secondary"}>{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
