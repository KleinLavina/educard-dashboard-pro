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

export const Route = createFileRoute("/grades")({
  component: GradesPage,
  head: () => ({
    meta: [
      { title: "Grades — EduCard Pro" },
      { name: "description", content: "Subject performance and grade distribution." },
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

const distribution = [
  { letter: "A", pct: 28, color: "var(--color-chart-2)" },
  { letter: "B", pct: 41, color: "var(--color-chart-1)" },
  { letter: "C", pct: 22, color: "var(--color-chart-4)" },
  { letter: "D", pct: 7, color: "var(--color-chart-3)" },
  { letter: "F", pct: 2, color: "var(--color-destructive)" },
];

const recent = [
  { teacher: "Ms. Aquino", student: "Juan Dela Cruz", subject: "Math", change: "B → A", time: "2h ago" },
  { teacher: "Mr. Lopez", student: "Maria Santos", subject: "Science", change: "B+ → A-", time: "4h ago" },
  { teacher: "Ms. Cruz", student: "Jose Rizal", subject: "English", change: "C+ → C", time: "Yesterday" },
];

function GradesPage() {
  return (
    <>
      <PageHeader title="Grades" subtitle="Subject performance · 3rd Quarter" />
      <main className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
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
              <CardTitle className="text-base">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {distribution.map((d) => (
                <div key={d.letter} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{d.letter}</span>
                    <span className="text-muted-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.pct * 2.5}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              ))}
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
                  <TableHead>Teacher</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.teacher}</TableCell>
                    <TableCell className="font-medium">{r.student}</TableCell>
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
