import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle, Bell, CheckCircle2, Info, X, BookOpen, CalendarCheck,
  Star, MessageCircle, GraduationCap, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: `Alerts — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type AlertTone = "warn" | "info" | "ok" | "critical";

interface AlertItem {
  id: number;
  icon: React.ElementType;
  title: string;
  text: string;
  time: string;
  tone: AlertTone;
  tag: string;
}

const PRINCIPAL_ALERTS: AlertItem[] = [
  { id: 1, icon: AlertTriangle, title: "9 sections below SF2 target", text: "Sections in Grade 8 and Grade 12 HUMSS are tracking below the 95% DepEd SF2 attendance target. Advisers notified.", time: "Today, 8:00 AM", tone: "critical", tag: "SF2" },
  { id: 2, icon: AlertTriangle, title: "6 learners with chronic absences", text: "Marco Reyes (G7), Mikael Cortes (G8), and 4 others have been flagged for chronic absenteeism this quarter.", time: "Today, 7:45 AM", tone: "warn", tag: "Attendance" },
  { id: 3, icon: Bell, title: "SF2 submission deadline — May 15", text: "Division Office requires all SF2 reports submitted no later than May 15, 2026. 3 sections have not yet confirmed.", time: "Yesterday", tone: "info", tag: "Deadline" },
  { id: 4, icon: Bell, title: "2 LRN reprint requests pending", text: "Ms. Aquino (G7 Sampaguita) and Mr. Lopez (G7 Rosal) submitted LRN reprint requests for 2 learners.", time: "Yesterday", tone: "info", tag: "ID Cards" },
  { id: 5, icon: CheckCircle2, title: "Grade 10 SF2 submitted", text: "Mr. Santos confirmed Grade 10 Charity SF2 report submitted. Attendance rate: 90.7%.", time: "2 days ago", tone: "ok", tag: "SF2" },
  { id: 6, icon: Shield, title: "System: SF2 batch export ready", text: "Quarterly SF2 batch PDF for all 12 sections is ready for download from the Registrar module.", time: "3 days ago", tone: "info", tag: "System" },
];

const TEACHER_ALERTS: AlertItem[] = [
  { id: 1, icon: AlertTriangle, title: "Carlo Villanueva — 2nd absent day", text: "Carlo P. Villanueva (LRN 136728140988) has been absent for 2 consecutive days. Parent notification sent via Messenger.", time: "Today", tone: "warn", tag: "Absence" },
  { id: 2, icon: CheckCircle2, title: "Math Q3 grades posted", text: "3rd Quarter Math grades for Grade 7 - Sampaguita have been posted. Class average: 89.0.", time: "2h ago", tone: "ok", tag: "Grades" },
  { id: 3, icon: CalendarCheck, title: "SF2 attendance submitted", text: "This week's SF2 attendance log has been submitted to the registrar for Grade 7 - Sampaguita.", time: "Yesterday", tone: "ok", tag: "SF2" },
  { id: 4, icon: Bell, title: "Grade submission deadline — May 20", text: "Reminder: 3rd Quarter final grades must be encoded by May 20, 2026.", time: "Yesterday", tone: "info", tag: "Deadline" },
  { id: 5, icon: BookOpen, title: "Science CSV import completed", text: "Bulk grade import from CSV for Science — 3rd Quarter completed successfully. 3 records updated.", time: "2 days ago", tone: "ok", tag: "Grades" },
];

const STUDENT_ALERTS: AlertItem[] = [
  { id: 1, icon: BookOpen, title: "Math Q3 grade posted — 92", text: "Ms. Aurora Aquino posted your 3rd Quarter Math grade: 92. You are On Track.", time: "2h ago", tone: "ok", tag: "Grade" },
  { id: 2, icon: CalendarCheck, title: "Attendance confirmed — May 10", text: "Your time-in was scanned at 7:38 AM today. Have a great school day!", time: "Today", tone: "ok", tag: "Attendance" },
  { id: 3, icon: Bell, title: "SF2 review — May 15", text: "Your adviser Ms. Aquino will review 3rd Quarter SF2 attendance on May 15. Your current rate: 96.4%.", time: "Yesterday", tone: "info", tag: "SF2" },
  { id: 4, icon: Star, title: "Ranked #1 in Filipino", text: "Congratulations! You ranked 1st in Filipino this quarter with a grade of 94.", time: "2 days ago", tone: "ok", tag: "Achievement" },
  { id: 5, icon: GraduationCap, title: "3rd Quarter report card available", text: "Your 3rd Quarter report card is now available for download. General average: 91.7.", time: "3 days ago", tone: "ok", tag: "Report Card" },
  { id: 6, icon: MessageCircle, title: "Message from Ms. Aquino", text: "Reminder: Science project is due this Friday, May 14. Submit via Google Classroom.", time: "3 days ago", tone: "info", tag: "Message" },
];

const toneConfig: Record<AlertTone, { bg: string; icon: string; badge: string }> = {
  critical: { bg: "bg-destructive/10 border-destructive/30", icon: "text-destructive", badge: "destructive" },
  warn: { bg: "bg-orange-500/5 border-orange-400/30", icon: "text-orange-500", badge: "outline" },
  ok: { bg: "bg-chart-2/5 border-chart-2/20", icon: "text-chart-2", badge: "secondary" },
  info: { bg: "bg-muted border-border/60", icon: "text-muted-foreground", badge: "outline" },
};

type TabFilter = "all" | "warn" | "ok" | "info";

function AlertFeed({ items }: { items: AlertItem[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<TabFilter>("all");

  const visible = items.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (tab === "warn") return a.tone === "warn" || a.tone === "critical";
    if (tab === "ok") return a.tone === "ok";
    if (tab === "info") return a.tone === "info";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {([["all", "All"], ["warn", "Warnings"], ["ok", "Updates"], ["info", "Reminders"]] as [TabFilter, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 font-ui text-xs uppercase tracking-wider transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
        {dismissed.size > 0 && (
          <button
            onClick={() => setDismissed(new Set())}
            className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
          >
            Restore {dismissed.size} dismissed
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((a) => {
          const cfg = toneConfig[a.tone];
          return (
            <div key={a.id} className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.bg}`}>
              <div className={`mt-0.5 shrink-0 ${cfg.icon}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <span className="rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.tag}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{a.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{a.time}</p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border bg-card py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-chart-2" />
            <p className="text-sm font-medium">All clear</p>
            <p className="text-xs text-muted-foreground">No alerts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsPage() {
  const { role } = useRole();
  const items = role === "principal" ? PRINCIPAL_ALERTS : role === "teacher" ? TEACHER_ALERTS : STUDENT_ALERTS;
  const critCount = items.filter((a) => a.tone === "critical" || a.tone === "warn").length;

  return (
    <>
      <PageHeader
        title={role === "student" ? "Notifications" : "Alerts & Notifications"}
        subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: items.length, accent: "text-foreground" },
            { label: "Action Needed", value: critCount, accent: critCount > 0 ? "text-destructive" : "text-chart-2" },
            { label: "Updates", value: items.filter(a => a.tone === "ok").length, accent: "text-chart-2" },
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
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">
              {role === "student" ? "Your Notifications" : "School Alerts Feed"}
            </CardTitle>
            <Button variant="outline" size="sm">Mark all read</Button>
          </CardHeader>
          <CardContent>
            <AlertFeed items={items} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
