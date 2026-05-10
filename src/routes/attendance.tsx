import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET, fullName, allSections, allLearners } from "@/lib/school-data";
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
          <CardHeader>
            <CardTitle className="text-base">SF2 Compliance by Section</CardTitle>
            <p className="text-xs text-muted-foreground">3rd Quarter · Week 6 · Target ≥ {SF2_TARGET}%</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allSections.map((s) => (
                <div key={s.section.id} className={`flex items-center gap-4 rounded-xl border p-4 ${s.belowTarget ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-card"}`}>
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

  function toggle(lrn: string, day: string) {
    setMarks((prev) => ({
      ...prev,
      [lrn]: { ...prev[lrn], [day]: prev[lrn][day] === "P" ? "A" : "P" },
    }));
    setSaved(false);
  }

  const presentToday = learners.filter((l) => marks[l.lrn][DAYS[4]] === "P").length;

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
          <CardHeader>
            <CardTitle className="text-base">Weekly Attendance Log</CardTitle>
            <p className="text-xs text-muted-foreground">3rd Quarter · {SCHOOL_NAME}</p>
          </CardHeader>
          <CardContent className="space-y-4">
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
