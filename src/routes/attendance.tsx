import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
  head: () => ({
    meta: [
      { title: "Attendance — EduCard Pro" },
      { name: "description", content: "Track daily and weekly attendance trends." },
    ],
  }),
});

const data = [
  { day: "Mon", present: 460, absent: 27 },
  { day: "Tue", present: 448, absent: 39 },
  { day: "Wed", present: 433, absent: 54 },
  { day: "Thu", present: 463, absent: 24 },
  { day: "Fri", present: 443, absent: 44 },
  { day: "Sat", present: 428, absent: 59 },
  { day: "Sun", present: 452, absent: 35 },
];

const sections = [
  { name: "G7 Sampaguita", rate: 96 },
  { name: "G8 Rosal", rate: 91 },
  { name: "G9 Adelfa", rate: 84 },
  { name: "G10 Ilang-Ilang", rate: 94 },
  { name: "G11 STEM", rate: 89 },
];

function AttendancePage() {
  return (
    <>
      <PageHeader title="Attendance" subtitle="Live attendance for May 9, 2026" />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#present)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.rate}%`,
                      background: "var(--gradient-primary)",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
