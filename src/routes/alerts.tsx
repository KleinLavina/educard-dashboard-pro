import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Alerts — EduCard Pro" },
      { name: "description", content: "School-wide alerts and notifications." },
    ],
  }),
});

const items = [
  { icon: AlertTriangle, tone: "warn", title: "Chronic absences", text: "5 students absent for 3+ days", time: "10 min ago" },
  { icon: Bell, tone: "info", title: "Print queue", text: "3 report cards pending printing", time: "1h ago" },
  { icon: AlertTriangle, tone: "warn", title: "Grade dispute", text: "2 grade disputes awaiting review", time: "2h ago" },
  { icon: Info, tone: "info", title: "Parent request", text: "1 parent requested ID reprint", time: "Yesterday" },
  { icon: CheckCircle2, tone: "ok", title: "Quarter closed", text: "2nd Quarter grades sealed successfully", time: "2 days ago" },
];

const tones: Record<string, string> = {
  warn: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  ok: "bg-accent/20 text-accent-foreground",
};

function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Notifications across the school" />
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
