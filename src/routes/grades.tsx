import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allLearners, allSections, fullName } from "@/lib/school-data";

export const Route = createFileRoute("/grades")({
  component: GradesPage,
  head: () => ({
    meta: [
      { title: "Grades — EduCard Pro" },
      { name: "description", content: "Subject performance and grade distribution by section." },
    ],
  }),
});

const subjects = [
  { name: "Math", avg: 84 },
  { name: "Science", avg: 87 },
  { name: "English", avg: 81 },
  { name: "Filipino", avg: 89 },
  { name: "Araling Panlipunan", avg: 85 },
  { name: "MAPEH", avg: 92 },
];

const sectionAvgs = allSections
  .map((s) => ({
    name: s.label.replace("Grade ", "G").replace(" - ", "-"),
    avg: Math.round(
      s.section.learners.reduce((a, l) => a + l.gpa, 0) /
        Math.max(s.section.learners.length, 1),
    ),
  }))
  .sort((a, b) => b.avg - a.avg);

const recentChanges = allLearners.slice(0, 5).map((l, i) => ({
  teacher: ["Ms. Aquino", "Mr. Lopez", "Ms. Cruz", "Mr. Tan", "Ms. Domingo"][i % 5],
  student: fullName(l.learner),
  section: l.sectionLabel,
  subject: ["Math", "Science", "English", "Filipino", "AP"][i % 5],
  change: ["B → A", "B+ → A-", "C+ → B-", "A- → A", "C → C+"][i % 5],
  time: ["2h ago", "4h ago", "Yesterday", "Yesterday", "2d ago"][i % 5],
}));

function GradesPage() {
  return (
    <>
      <PageHeader title="Grades" subtitle="Subject performance · 3rd Quarter" />
      <main className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average by Subject</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjects}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="avg" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section GPA Ranking</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionAvgs} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" domain={[60, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} width={130} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="avg" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Grade Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Teacher</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentChanges.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.teacher}</TableCell>
                    <TableCell className="font-medium">{r.student}</TableCell>
                    <TableCell className="text-muted-foreground">{r.section}</TableCell>
                    <TableCell className="text-muted-foreground">{r.subject}</TableCell>
                    <TableCell className="font-mono text-xs">{r.change}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
