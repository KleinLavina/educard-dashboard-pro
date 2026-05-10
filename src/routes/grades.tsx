import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, TrendingUp, CheckCircle2, Save, Upload } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, SF2_TARGET, fullName, allSections, allLearners } from "@/lib/school-data";
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
          <CardHeader>
            <CardTitle className="text-base">Average GPA by Section</CardTitle>
            <p className="text-xs text-muted-foreground">3rd Quarter · passing mark 75</p>
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

  function save() { setEditMode(false); setSaved(true); }

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" /> Academic Transcript — SY {SCHOOL_YEAR}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Grade 7 - Sampaguita · {SCHOOL_NAME}</p>
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
      </main>
    </>
  );
}
