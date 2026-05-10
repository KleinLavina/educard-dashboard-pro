import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { allSections, allLearners, SF2_TARGET, fullName } from "@/lib/school-data";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Alerts — EduCard Pro" },
      { name: "description", content: "School-wide alerts and SF2 follow-ups." },
    ],
  }),
});

const belowSections = allSections.filter((s) => s.belowTarget);
const flagged = allLearners.filter((l) => l.learner.attendanceRate < SF2_TARGET);

const items = [
  ...belowSections.map((s) => ({
    icon: AlertTriangle,
    tone: "warn" as const,
    title: `${s.label} below SF2 target`,
    text: `Attendance ${s.attendance.toFixed(1)}% (target ${SF2_TARGET}%) — Adviser ${s.section.adviser}`,
    time: "Today",
  })),
  ...flagged.slice(0, 3).map((l) => ({
    icon: AlertTriangle,
    tone: "warn" as const,
    title: `Chronic absence: ${fullName(l.learner)}`,
    text: `LRN ${l.learner.lrn} · ${l.sectionLabel} · ${l.learner.attendanceRate.toFixed(1)}%`,
    time: "Today",
  })),
  {
    icon: Bell,
    tone: "info" as const,
    title: "SF2 submission reminder",
    text: "Submit SF2 to Division Office on or before May 15",
    time: "1d ago",
  },
  {
    icon: Info,
    tone: "info" as const,
    title: "LRN reprint request",
    text: "1 parent requested a reissued LRN ID card",
    time: "Yesterday",
  },
  {
    icon: CheckCircle2,
    tone: "ok" as const,
    title: "Quarter sealed",
    text: "2nd Quarter grades successfully sealed",
    time: "2d ago",
  },
];

const tones: Record<string, string> = {
  warn: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  ok: "bg-accent/20 text-accent-foreground",
};

function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="SF2 follow-ups and registrar notices" />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className={`rounded-lg p-2 ${tones[a.tone]}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    <Badge variant="outline" className="text-[10px]">{a.time}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
