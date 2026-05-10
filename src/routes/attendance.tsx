import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { allSections, departments, SF2_TARGET, totals } from "@/lib/school-data";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
  head: () => ({
    meta: [
      { title: "Attendance — EduCard Pro" },
      { name: "description", content: "DepEd SF2 attendance grouped by department, grade, and section." },
    ],
  }),
});

const trend = [
  { day: "Mon", present: 96, absent: 4 },
  { day: "Tue", present: 93, absent: 7 },
  { day: "Wed", present: 89, absent: 11 },
  { day: "Thu", present: 95, absent: 5 },
  { day: "Fri", present: 91, absent: 9 },
];

function AttendancePage() {
  return (
    <>
      <PageHeader
        title="Attendance (SF2)"
        subtitle={`Daily attendance grouped by section · Target ${SF2_TARGET}%`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Campus Trend — This Week</CardTitle>
            <span className="text-xs text-muted-foreground">
              Avg {totals.campusAttendance.toFixed(1)}%
            </span>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="var(--color-muted-foreground)" fontSize={12} unit="%" />
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

        {departments.map((dept) => {
          const deptSections = allSections.filter((s) => s.department.key === dept.key);
          return (
            <Card key={dept.key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{dept.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{dept.caption}</p>
                </div>
                <Badge variant="outline">{deptSections.length} sections</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {deptSections.map((es) => (
                  <div key={es.section.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          Daily Attendance for {es.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Adviser {es.section.adviser} · {es.enrolled} learners
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            es.belowTarget ? "text-destructive" : ""
                          }`}
                        >
                          {es.attendance.toFixed(1)}%
                        </span>
                        {es.belowTarget && (
                          <Badge variant="destructive" className="text-[10px]">
                            Below Target
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(es.attendance, 100)}%`,
                          background: es.belowTarget
                            ? "var(--color-destructive)"
                            : "var(--gradient-primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </main>
    </>
  );
}
